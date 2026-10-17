import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import {
  academyCourses as academyCoursesTable,
  academyEnrollments as academyEnrollmentsTable,
  academyQuizQuestions as academyQuizQuestionsTable,
  academyQuizAnswers as academyQuizAnswersTable,
  academyQuizSubmissions as academyQuizSubmissionsTable,
} from "./schema";
import { progressPercent } from "@/lib/academy/progress";
import { computeSubmissionScore, isSubmissionFullyGraded } from "@/lib/academy/quiz";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  materialUrl: string | null;
  materialFileName: string | null;
};

type QuizQuestionBase = { id: string; text: string };

export type MultipleChoiceQuestion = QuizQuestionBase & {
  type: "multiple_choice";
  options: string[];
  correctOptionIndex: number;
};

export type MultipleSelectQuestion = QuizQuestionBase & {
  type: "multiple_select";
  options: string[];
  // Exact-set match against the student's selection — all-or-nothing, no
  // partial credit for picking some but not all of these.
  correctOptionIndexes: number[];
};

export type FreeTextQuestion = QuizQuestionBase & {
  type: "free_text";
  // Sent to the AI grader alongside the student's response — see
  // lib/academy/ai-grading.ts.
  rubric: string;
  modelAnswer: string;
};

export type QuizQuestion = MultipleChoiceQuestion | MultipleSelectQuestion | FreeTextQuestion;

export type Quiz = {
  id: string;
  title: string;
  availableAt: string | null;
  questions: QuizQuestion[];
};
export type Module = { id: string; title: string; lessons: Lesson[]; test: Quiz | null };
export type LocalizedCourseText = { title: string; description: string };

export type LearningMode = "self_paced" | "classroom";

export type AcademyCourse = {
  id: string;
  courseId: string | null;
  slug: string;
  fr: LocalizedCourseText;
  en: LocalizedCourseText;
  modules: Module[];
  selfPacedFeeCents: number | null;
  classroomFeeCents: number | null;
  finalExam: Quiz | null;
  createdAt: string;
  createdBy: string | null;
};

export type QuizAnswer = {
  id: string;
  submissionId: string;
  questionId: string;
  questionType: QuizQuestion["type"];
  selectedOptionIndex: number | null; // multiple_choice
  selectedOptionIndexes: number[] | null; // multiple_select
  freeTextResponse: string | null; // free_text
  // 0-100, this question's contribution to the quiz score. multiple_choice
  // /multiple_select resolve this synchronously at submit time. free_text
  // starts at 0 and only becomes authoritative once reviewStatus is
  // "approved" or "adjusted" — see aiScorePercent for the interim AI
  // suggestion, which is not shown to the student pre-approval.
  scorePercent: number;
  aiGradingStatus: "not_applicable" | "pending" | "graded" | "failed";
  aiScorePercent: number | null;
  aiRationale: string | null;
  aiGradedAt: string | null;
  aiError: string | null;
  reviewStatus: "not_applicable" | "pending" | "approved" | "adjusted";
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type QuizSubmission = {
  id: string;
  enrollmentId: string;
  quizId: string;
  // Recomputed average of answers[].scorePercent — provisional (not shown to
  // the student) while gradingStatus is "pending_review".
  scorePercent: number;
  gradingStatus: "graded" | "pending_review";
  submittedAt: string;
  // Set once every free_text answer has been teacher-reviewed. Null for
  // multiple_choice/multiple_select-only submissions' initial state too,
  // briefly, until the insert sets it — see createQuizSubmission.
  finalizedAt: string | null;
  answers: QuizAnswer[];
};

export type AcademyEnrollment = {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  completedLessonIds: string[];
  certificateIssued: boolean;
  certificateFileUrl: string | null;
  feePaid: boolean;
  feePaidAt: string | null;
  learningMode: LearningMode | null;
  createdAt: string;
  createdBy: string | null;
};

// A quiz's question rows live in academyQuizQuestions, keyed by the quiz's
// own id (a module test's or the final exam's id) — not by the course. This
// row shape mirrors QuizQuestion's discriminated union with flat nullable
// columns per variant (see schema.ts for why).
function questionRowToQuizQuestion(row: typeof academyQuizQuestionsTable.$inferSelect): QuizQuestion {
  const base = { id: row.id, text: row.text };
  if (row.type === "multiple_choice") {
    return {
      ...base,
      type: "multiple_choice",
      options: row.options ?? [],
      correctOptionIndex: row.correctOptionIndex ?? 0,
    };
  }
  if (row.type === "multiple_select") {
    return {
      ...base,
      type: "multiple_select",
      options: row.options ?? [],
      correctOptionIndexes: row.correctOptionIndexes ?? [],
    };
  }
  return { ...base, type: "free_text", rubric: row.rubric ?? "", modelAnswer: row.modelAnswer ?? "" };
}

function quizQuestionToRow(quizId: string, order: number, q: QuizQuestion) {
  return {
    id: q.id,
    quizId,
    order,
    type: q.type,
    text: q.text,
    options: q.type === "free_text" ? null : q.options,
    correctOptionIndex: q.type === "multiple_choice" ? q.correctOptionIndex : null,
    correctOptionIndexes: q.type === "multiple_select" ? q.correctOptionIndexes : null,
    rubric: q.type === "free_text" ? q.rubric : null,
    modelAnswer: q.type === "free_text" ? q.modelAnswer : null,
  };
}

export async function getQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const rows = await db
    .select()
    .from(academyQuizQuestionsTable)
    .where(eq(academyQuizQuestionsTable.quizId, quizId))
    .orderBy(asc(academyQuizQuestionsTable.order));
  return rows.map(questionRowToQuizQuestion);
}

// Looked up directly by question id (not quizId) — used by AI grading,
// which only has a QuizAnswer's questionId on hand.
export async function getQuizQuestionById(id: string): Promise<QuizQuestion | undefined> {
  const [row] = await db.select().from(academyQuizQuestionsTable).where(eq(academyQuizQuestionsTable.id, id));
  return row ? questionRowToQuizQuestion(row) : undefined;
}

async function getQuestionsByQuizIds(quizIds: string[]): Promise<Map<string, QuizQuestion[]>> {
  const map = new Map<string, QuizQuestion[]>();
  if (quizIds.length === 0) return map;
  const rows = await db
    .select()
    .from(academyQuizQuestionsTable)
    .where(inArray(academyQuizQuestionsTable.quizId, quizIds))
    .orderBy(asc(academyQuizQuestionsTable.order));
  for (const row of rows) {
    const list = map.get(row.quizId) ?? [];
    list.push(questionRowToQuizQuestion(row));
    map.set(row.quizId, list);
  }
  return map;
}

// Attaches each quiz's questions (batched in one query, not N+1) to raw
// course rows, producing the app-facing AcademyCourse shape — the DB row
// itself only carries {id, title, availableAt} per quiz now.
async function hydrateCourseQuestions(
  rows: (typeof academyCoursesTable.$inferSelect)[]
): Promise<AcademyCourse[]> {
  const quizIds = new Set<string>();
  for (const row of rows) {
    for (const m of row.modules) if (m.test) quizIds.add(m.test.id);
    if (row.finalExam) quizIds.add(row.finalExam.id);
  }
  const questionsByQuiz = await getQuestionsByQuizIds(Array.from(quizIds));
  return rows.map((row) => ({
    ...row,
    modules: row.modules.map((m) => ({
      ...m,
      test: m.test ? { ...m.test, questions: questionsByQuiz.get(m.test.id) ?? [] } : null,
    })),
    finalExam: row.finalExam ? { ...row.finalExam, questions: questionsByQuiz.get(row.finalExam.id) ?? [] } : null,
  }));
}

export async function getAcademyCourses(): Promise<AcademyCourse[]> {
  const rows = await db.select().from(academyCoursesTable);
  return hydrateCourseQuestions(rows);
}

export async function getAcademyCourseById(id: string): Promise<AcademyCourse | undefined> {
  const [row] = await db.select().from(academyCoursesTable).where(eq(academyCoursesTable.id, id));
  if (!row) return undefined;
  const [hydrated] = await hydrateCourseQuestions([row]);
  return hydrated;
}

export async function getAcademyCourseBySlug(slug: string): Promise<AcademyCourse | undefined> {
  const [row] = await db.select().from(academyCoursesTable).where(eq(academyCoursesTable.slug, slug));
  if (!row) return undefined;
  const [hydrated] = await hydrateCourseQuestions([row]);
  return hydrated;
}

// Full-replace semantics for a course's quiz questions, matching QuizEditor's
// existing convention of resending the complete question list on every save
// (no diffing). The course row's own jsonb only stores {id, title,
// availableAt} per quiz — questions live solely in academyQuizQuestions.
export async function saveAcademyCourse(course: AcademyCourse): Promise<void> {
  const courseForStorage = {
    ...course,
    modules: course.modules.map((m) => ({
      ...m,
      test: m.test ? { id: m.test.id, title: m.test.title, availableAt: m.test.availableAt } : null,
    })),
    finalExam: course.finalExam
      ? { id: course.finalExam.id, title: course.finalExam.title, availableAt: course.finalExam.availableAt }
      : null,
  };

  await db
    .insert(academyCoursesTable)
    .values(courseForStorage)
    .onConflictDoUpdate({ target: academyCoursesTable.id, set: courseForStorage });

  const quizzes = [...course.modules.map((m) => m.test), course.finalExam].filter(
    (q): q is Quiz => q !== null
  );
  for (const quiz of quizzes) {
    await db.delete(academyQuizQuestionsTable).where(eq(academyQuizQuestionsTable.quizId, quiz.id));
    if (quiz.questions.length > 0) {
      await db.insert(academyQuizQuestionsTable).values(quiz.questions.map((q, i) => quizQuestionToRow(quiz.id, i, q)));
    }
  }
}

export async function deleteAcademyCourse(id: string): Promise<void> {
  await db.delete(academyCoursesTable).where(eq(academyCoursesTable.id, id));
}

export async function getAcademyEnrollments(): Promise<AcademyEnrollment[]> {
  return db.select().from(academyEnrollmentsTable);
}

export async function getAcademyEnrollmentById(id: string): Promise<AcademyEnrollment | undefined> {
  const [row] = await db
    .select()
    .from(academyEnrollmentsTable)
    .where(eq(academyEnrollmentsTable.id, id));
  return row;
}

export async function getEnrollmentByStudentId(studentId: string): Promise<AcademyEnrollment | undefined> {
  const [row] = await db
    .select()
    .from(academyEnrollmentsTable)
    .where(eq(academyEnrollmentsTable.studentId, studentId));
  return row;
}

// A student can be enrolled in several courses (one row per course, all
// sharing the same studentId — see getNextStudentId), but users.linkedId
// only points at one of those rows. The student-facing portal resolves the
// studentId from that one linked row, then uses this to fetch every course
// they're enrolled in.
export async function getEnrollmentsByStudentId(studentId: string): Promise<AcademyEnrollment[]> {
  return db.select().from(academyEnrollmentsTable).where(eq(academyEnrollmentsTable.studentId, studentId));
}

/** One row per distinct student (deduped from possibly-many course rows), for the "existing student" picker. */
export async function getDistinctStudents(): Promise<
  Pick<AcademyEnrollment, "studentId" | "studentName" | "email" | "phone">[]
> {
  const enrollments = await getAcademyEnrollments();
  const seen = new Map<string, AcademyEnrollment>();
  for (const e of enrollments) {
    if (!seen.has(e.studentId)) seen.set(e.studentId, e);
  }
  return Array.from(seen.values()).map(({ studentId, studentName, email, phone }) => ({
    studentId,
    studentName,
    email,
    phone,
  }));
}

export async function saveAcademyEnrollment(enrollment: AcademyEnrollment): Promise<void> {
  await db
    .insert(academyEnrollmentsTable)
    .values(enrollment)
    .onConflictDoUpdate({ target: academyEnrollmentsTable.id, set: enrollment });
}

export async function markEnrollmentFeePaid(id: string): Promise<void> {
  await db
    .update(academyEnrollmentsTable)
    .set({ feePaid: true, feePaidAt: new Date().toISOString() })
    .where(eq(academyEnrollmentsTable.id, id));
}

// A targeted update rather than saveAcademyEnrollment's full-row upsert, so
// recording the chosen mode can't clobber a concurrent progress write.
export async function setEnrollmentLearningMode(id: string, learningMode: LearningMode): Promise<void> {
  await db.update(academyEnrollmentsTable).set({ learningMode }).where(eq(academyEnrollmentsTable.id, id));
}

export async function deleteAcademyEnrollment(id: string): Promise<void> {
  await db.delete(academyEnrollmentsTable).where(eq(academyEnrollmentsTable.id, id));
}

async function attachAnswers(
  rows: (typeof academyQuizSubmissionsTable.$inferSelect)[]
): Promise<QuizSubmission[]> {
  if (rows.length === 0) return [];
  const submissionIds = rows.map((r) => r.id);
  const allAnswers = await db
    .select()
    .from(academyQuizAnswersTable)
    .where(inArray(academyQuizAnswersTable.submissionId, submissionIds));
  const answersBySubmission = new Map<string, QuizAnswer[]>();
  for (const a of allAnswers) {
    const list = answersBySubmission.get(a.submissionId) ?? [];
    list.push(a);
    answersBySubmission.set(a.submissionId, list);
  }
  return rows.map((row) => ({ ...row, answers: answersBySubmission.get(row.id) ?? [] }));
}

export async function getQuizSubmissionById(id: string): Promise<QuizSubmission | undefined> {
  const [row] = await db.select().from(academyQuizSubmissionsTable).where(eq(academyQuizSubmissionsTable.id, id));
  if (!row) return undefined;
  const [hydrated] = await attachAnswers([row]);
  return hydrated;
}

export async function getQuizSubmission(
  enrollmentId: string,
  quizId: string
): Promise<QuizSubmission | undefined> {
  const [row] = await db
    .select()
    .from(academyQuizSubmissionsTable)
    .where(and(eq(academyQuizSubmissionsTable.enrollmentId, enrollmentId), eq(academyQuizSubmissionsTable.quizId, quizId)));
  if (!row) return undefined;
  const [hydrated] = await attachAnswers([row]);
  return hydrated;
}

export async function getQuizSubmissionsForEnrollment(enrollmentId: string): Promise<QuizSubmission[]> {
  const rows = await db
    .select()
    .from(academyQuizSubmissionsTable)
    .where(eq(academyQuizSubmissionsTable.enrollmentId, enrollmentId));
  return attachAnswers(rows);
}

export async function getQuizAnswersForSubmission(submissionId: string): Promise<QuizAnswer[]> {
  return db.select().from(academyQuizAnswersTable).where(eq(academyQuizAnswersTable.submissionId, submissionId));
}

export async function getSubmissionsPendingReview(): Promise<QuizSubmission[]> {
  const rows = await db
    .select()
    .from(academyQuizSubmissionsTable)
    .where(eq(academyQuizSubmissionsTable.gradingStatus, "pending_review"));
  return attachAnswers(rows);
}

// Nav badge count — mirrors getPendingChangesCount("pending")'s usage in
// app/admin/layout.tsx.
export async function getPendingReviewAnswersCount(): Promise<number> {
  const rows = await db
    .select({ id: academyQuizAnswersTable.id })
    .from(academyQuizAnswersTable)
    .where(eq(academyQuizAnswersTable.reviewStatus, "pending"));
  return rows.length;
}

// One attempt per quiz, ever — the identity fields here (id, enrollmentId,
// quizId, submittedAt) are immutable, matching the original "insert only"
// rule on academyQuizSubmissions. Grading fields (scorePercent,
// gradingStatus, finalizedAt) ARE updated later, but only ever by
// recomputeSubmissionScore reading back from academyQuizAnswers — never a
// freeform overwrite.
export async function createQuizSubmission(
  submission: Omit<QuizSubmission, "answers">,
  answers: QuizAnswer[]
): Promise<void> {
  await db.insert(academyQuizSubmissionsTable).values(submission);
  if (answers.length > 0) {
    await db.insert(academyQuizAnswersTable).values(answers);
  }
}

export async function getQuizAnswerById(id: string): Promise<QuizAnswer | undefined> {
  const [row] = await db.select().from(academyQuizAnswersTable).where(eq(academyQuizAnswersTable.id, id));
  return row;
}

export async function updateQuizAnswerAiGrading(
  id: string,
  update:
    | { status: "graded"; scorePercent: number; rationale: string; gradedAt: string }
    | { status: "failed"; error: string }
): Promise<void> {
  if (update.status === "graded") {
    await db
      .update(academyQuizAnswersTable)
      .set({
        aiGradingStatus: "graded",
        aiScorePercent: update.scorePercent,
        aiRationale: update.rationale,
        aiGradedAt: update.gradedAt,
        aiError: null,
        // The AI's suggestion becomes the row's working score — still
        // provisional (not shown to the student) until reviewStatus leaves
        // "pending".
        scorePercent: update.scorePercent,
      })
      .where(eq(academyQuizAnswersTable.id, id));
  } else {
    await db
      .update(academyQuizAnswersTable)
      .set({ aiGradingStatus: "failed", aiError: update.error })
      .where(eq(academyQuizAnswersTable.id, id));
  }
}

export async function updateQuizAnswerReview(
  id: string,
  update: { status: "approved" | "adjusted"; reviewedBy: string; scorePercent: number; reviewNote?: string | null }
): Promise<void> {
  await db
    .update(academyQuizAnswersTable)
    .set({
      reviewStatus: update.status,
      reviewedBy: update.reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote: update.reviewNote ?? null,
      scorePercent: update.scorePercent,
    })
    .where(eq(academyQuizAnswersTable.id, id));
}

// The single choke point that finalizes a submission: recomputes
// scorePercent from current answer rows and flips gradingStatus to "graded"
// (setting finalizedAt) once no answer is still aiGradingStatus:"pending" or
// reviewStatus:"pending". Called after initial submit, after AI grading
// completes, and after each teacher review action.
export async function recomputeSubmissionScore(submissionId: string): Promise<QuizSubmission | undefined> {
  const answers = await db
    .select()
    .from(academyQuizAnswersTable)
    .where(eq(academyQuizAnswersTable.submissionId, submissionId));
  const scorePercent = computeSubmissionScore(answers);
  const fullyGraded = isSubmissionFullyGraded(answers);

  await db
    .update(academyQuizSubmissionsTable)
    .set({
      scorePercent,
      gradingStatus: fullyGraded ? "graded" : "pending_review",
      finalizedAt: fullyGraded ? new Date().toISOString() : null,
    })
    .where(eq(academyQuizSubmissionsTable.id, submissionId));

  const [row] = await db.select().from(academyQuizSubmissionsTable).where(eq(academyQuizSubmissionsTable.id, submissionId));
  return row ? { ...row, answers } : undefined;
}

/**
 * CPCYYFDDLNNN — YY/DD are the registration year/day (today), F/L are the
 * first letters of the student's first/last name, and NNN is the next
 * available multiple of 3 among existing students sharing that exact
 * YY+F+DD+L combination (see docs/student-id-spec).
 */
export async function getNextStudentId(firstName: string, lastName: string): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  const f = firstName.trim().charAt(0).toUpperCase();
  const dd = String(now.getDate()).padStart(2, "0");
  const l = lastName.trim().charAt(0).toUpperCase();
  const prefix = `CPC${yy}${f}${dd}${l}`;

  const rows = await db.select({ studentId: academyEnrollmentsTable.studentId }).from(academyEnrollmentsTable);
  let max = 0;
  for (const { studentId } of rows) {
    if (!studentId.startsWith(prefix)) continue;
    const seq = Number(studentId.slice(prefix.length));
    if (!Number.isNaN(seq) && seq > max) max = seq;
  }

  // Round up to the next multiple of 3 rather than adding 3 outright, since
  // `max` may be a leftover multiple of 7 from before the switch to 3.
  const next = (Math.floor(max / 3) + 1) * 3;
  if (next > 999) throw new Error(`No Student ID sequence left for ${prefix} today — all 333 slots are used.`);
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export type AcademyStats = {
  totalCourses: number;
  totalStudents: number;
  certificatesIssued: number;
  averageProgress: number;
  enrollmentsByCourse: { label: string; value: number }[];
};

export function computeAcademyStats(
  courses: AcademyCourse[],
  enrollments: AcademyEnrollment[]
): AcademyStats {
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const progressValues = enrollments.map((e) => progressPercent(e, courseById.get(e.courseId)));
  const averageProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length)
    : 0;

  const enrollmentCounts = new Map<string, number>();
  for (const e of enrollments) {
    enrollmentCounts.set(e.courseId, (enrollmentCounts.get(e.courseId) ?? 0) + 1);
  }

  const enrollmentsByCourse = courses
    .map((c) => ({ label: c.en.title, value: enrollmentCounts.get(c.id) ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return {
    totalCourses: courses.length,
    totalStudents: enrollments.length,
    certificatesIssued: enrollments.filter((e) => e.certificateIssued).length,
    averageProgress,
    enrollmentsByCourse,
  };
}

export async function getAcademyStats(): Promise<AcademyStats> {
  const [courses, enrollments] = await Promise.all([getAcademyCourses(), getAcademyEnrollments()]);
  return computeAcademyStats(courses, enrollments);
}
