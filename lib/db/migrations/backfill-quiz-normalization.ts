import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  academyQuizQuestions as academyQuizQuestionsTable,
  academyQuizAnswers as academyQuizAnswersTable,
  academyQuizSubmissions as academyQuizSubmissionsTable,
} from "@/lib/db/schema";

/**
 * One-off backfill for the quiz normalization redesign: populates
 * academy_quiz_questions and academy_quiz_answers from the OLD jsonb shapes
 * — academy_courses.modules[].test.questions/final_exam.questions, and
 * academy_quiz_submissions.answers — that predate this schema change. Every
 * pre-existing question/answer is implicitly multiple_choice, since that
 * was the only question type before this redesign.
 *
 * Ordering (see the plan's Phase 2 rollout note):
 *   1. Deploy the additive schema migration (new tables + new columns on
 *      academy_quiz_submissions — nothing dropped yet).
 *   2. Run this script against that database (defaults to --dry-run;
 *      pass --apply to actually write).
 *   3. Verify row counts / the mismatch warnings below are clean.
 *   4. Only then deploy app code that reads from the new tables, and
 *      generate/apply the follow-up migration that drops
 *      academy_quiz_submissions.answers.
 *
 * Reads the pre-migration columns via raw SQL because schema.ts (the
 * source of truth for the rest of the app) no longer maps them — by design,
 * so the app code this backfill precedes can't accidentally read stale
 * shapes.
 *
 * Usage: npx tsx --env-file=.env.local lib/db/migrations/backfill-quiz-normalization.ts [--apply]
 */

type LegacyQuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
};

type LegacyQuiz = {
  id: string;
  title: string;
  availableAt: string | null;
  questions: LegacyQuizQuestion[];
};

type LegacyModule = { id: string; title: string; test: LegacyQuiz | null };

type LegacyCourseRow = {
  id: string;
  modules: LegacyModule[];
  final_exam: LegacyQuiz | null;
};

type LegacySubmissionRow = {
  id: string;
  enrollment_id: string;
  quiz_id: string;
  answers: Record<string, number>;
  score_percent: number;
  submitted_at: string;
};

const APPLY = process.argv.includes("--apply");

async function main() {
  console.log(
    APPLY
      ? "Running in APPLY mode — this will write to the database."
      : "Running in DRY RUN mode — no writes will happen (pass --apply to write)."
  );

  const courseResult = await db.execute<LegacyCourseRow>(sql`SELECT id, modules, final_exam FROM academy_courses`);
  const courseRows = courseResult.rows;

  const questionsByQuizId = new Map<string, LegacyQuizQuestion[]>();
  for (const course of courseRows) {
    for (const m of course.modules ?? []) {
      if (m.test) questionsByQuizId.set(m.test.id, m.test.questions ?? []);
    }
    if (course.final_exam) questionsByQuizId.set(course.final_exam.id, course.final_exam.questions ?? []);
  }
  const totalQuizzes = questionsByQuizId.size;
  const totalQuestions = Array.from(questionsByQuizId.values()).reduce((sum, qs) => sum + qs.length, 0);
  console.log(`Found ${totalQuizzes} quizzes (${totalQuestions} questions total) across ${courseRows.length} courses.`);

  // Idempotency: skip any quiz that already has question rows, so a re-run
  // after a partial failure doesn't insert duplicates (question ids are
  // stable across runs — same source jsonb — so onConflictDoNothing below
  // would also catch this, but checking up front lets us report accurate
  // "prepared" counts).
  const existingQuestionQuizIds = new Set(
    (await db.selectDistinct({ quizId: academyQuizQuestionsTable.quizId }).from(academyQuizQuestionsTable)).map(
      (r) => r.quizId
    )
  );

  const questionRows: (typeof academyQuizQuestionsTable.$inferInsert)[] = [];
  for (const [quizId, questions] of questionsByQuizId) {
    if (existingQuestionQuizIds.has(quizId)) continue;
    questions.forEach((q, index) => {
      questionRows.push({
        id: q.id,
        quizId,
        order: index,
        type: "multiple_choice",
        text: q.text,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        correctOptionIndexes: null,
        rubric: null,
        modelAnswer: null,
      });
    });
  }
  console.log(`Prepared ${questionRows.length} question rows for insertion (others already migrated).`);

  const submissionResult = await db.execute<LegacySubmissionRow>(
    sql`SELECT id, enrollment_id, quiz_id, answers, score_percent, submitted_at FROM academy_quiz_submissions`
  );
  const submissionRows = submissionResult.rows;
  console.log(`Found ${submissionRows.length} existing quiz submissions.`);

  const existingAnswerSubmissionIds = new Set(
    (await db.selectDistinct({ submissionId: academyQuizAnswersTable.submissionId }).from(academyQuizAnswersTable)).map(
      (r) => r.submissionId
    )
  );

  const answerRows: (typeof academyQuizAnswersTable.$inferInsert)[] = [];
  const submissionsToFinalize: LegacySubmissionRow[] = [];
  let mismatches = 0;

  for (const submission of submissionRows) {
    const questions = questionsByQuizId.get(submission.quiz_id) ?? [];
    let correctCount = 0;

    for (const q of questions) {
      const selected = submission.answers?.[q.id];
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) correctCount++;

      if (existingAnswerSubmissionIds.has(submission.id)) continue;
      answerRows.push({
        id: crypto.randomUUID(),
        submissionId: submission.id,
        questionId: q.id,
        questionType: "multiple_choice",
        selectedOptionIndex: selected ?? null,
        selectedOptionIndexes: null,
        freeTextResponse: null,
        scorePercent: isCorrect ? 100 : 0,
        aiGradingStatus: "not_applicable",
        aiScorePercent: null,
        aiRationale: null,
        aiGradedAt: null,
        aiError: null,
        reviewStatus: "not_applicable",
        reviewedBy: null,
        reviewedAt: null,
        reviewNote: null,
      });
    }

    // Sanity check: the recomputed score (same formula as the old scoreQuiz)
    // must match the score this submission was actually stored with —
    // catches a bug in this script or a data assumption that doesn't hold,
    // before anything gets written.
    const recomputedScore = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);
    if (recomputedScore !== submission.score_percent) {
      mismatches++;
      console.warn(
        `Score mismatch for submission ${submission.id} (quiz ${submission.quiz_id}): stored ${submission.score_percent}%, recomputed ${recomputedScore}%.`
      );
    }

    if (!existingAnswerSubmissionIds.has(submission.id)) submissionsToFinalize.push(submission);
  }

  console.log(`Prepared ${answerRows.length} answer rows across ${submissionsToFinalize.length} submissions (others already migrated).`);

  if (mismatches > 0) {
    console.error(
      `${mismatches} submission(s) have a recomputed score that doesn't match the stored score — investigate before applying.`
    );
    if (APPLY) {
      console.error("Refusing to write with unresolved mismatches. Fix the data or this script, then re-run.");
      process.exitCode = 1;
      return;
    }
  }

  if (!APPLY) {
    console.log("Dry run complete — no writes made. Re-run with --apply to write.");
    return;
  }

  if (questionRows.length > 0) {
    await db.insert(academyQuizQuestionsTable).values(questionRows).onConflictDoNothing();
  }
  if (answerRows.length > 0) {
    await db.insert(academyQuizAnswersTable).values(answerRows).onConflictDoNothing();
  }
  for (const submission of submissionsToFinalize) {
    await db
      .update(academyQuizSubmissionsTable)
      .set({ gradingStatus: "graded", finalizedAt: submission.submitted_at })
      .where(eq(academyQuizSubmissionsTable.id, submission.id));
  }

  console.log("Backfill complete.");
}

main()
  .then(() => process.exit(process.exitCode ?? 0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
