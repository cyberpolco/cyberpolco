import { z } from "zod";
import {
  getQuizAnswerById,
  getQuizAnswersForSubmission,
  getQuizQuestionById,
  updateQuizAnswerAiGrading,
  recomputeSubmissionScore,
  type FreeTextQuestion,
} from "@/lib/db/academy";

/**
 * AI grading for free_text quiz answers, via the Gemini API's free tier
 * (https://ai.google.dev/gemini-api/docs) — plain fetch + zod validation,
 * matching this repo's existing convention for external APIs (see
 * lib/pawapay/client.ts) rather than pulling in an SDK.
 *
 * A score here is always a SUGGESTION: the caller (lib/actions/academy.ts)
 * leaves the answer's reviewStatus as "pending" regardless of outcome — a
 * teacher must approve or adjust it before it counts toward the student's
 * final score (see recomputeSubmissionScore / isSubmissionFullyGraded).
 */

const GEMINI_MODEL = "gemini-2.5-flash";

const gradingResponseSchema = z.object({
  scorePercent: z.number().min(0).max(100),
  rationale: z.string(),
});

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

export async function gradeFreeTextAnswer(
  question: FreeTextQuestion,
  response: string
): Promise<{ scorePercent: number; rationale: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to your environment variables (see .env.example).");
  }

  const prompt = [
    "You are grading a student's short-answer quiz response for a cybersecurity course.",
    "Score it from 0 to 100 based on how well it satisfies the grading rubric and covers the key points in the model answer.",
    "Award partial credit for a partially correct answer rather than only ever scoring 0 or 100.",
    "",
    `Question: ${question.text}`,
    `Grading rubric: ${question.rubric}`,
    `Model answer: ${question.modelAnswer}`,
    `Student's response: ${response || "(no answer given)"}`,
  ].join("\n");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            scorePercent: { type: "integer" },
            rationale: { type: "string" },
          },
          required: ["scorePercent", "rationale"],
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API request failed (${res.status}): ${await res.text()}`);
  }

  const body: unknown = await res.json();
  const text = (body as { candidates?: { content?: { parts?: { text?: string }[] } }[] })?.candidates?.[0]?.content
    ?.parts?.[0]?.text;
  if (typeof text !== "string") {
    throw new Error("Gemini API response did not contain the expected text output.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(text);
  } catch {
    throw new Error(`Gemini API returned non-JSON output: ${text}`);
  }

  const parsed = gradingResponseSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(`Gemini API returned an unexpected shape: ${parsed.error.message}`);
  }

  return { scorePercent: Math.round(parsed.data.scorePercent), rationale: parsed.data.rationale };
}

async function gradeAnswerById(answerId: string, question: FreeTextQuestion, response: string): Promise<void> {
  try {
    const { scorePercent, rationale } = await gradeFreeTextAnswer(question, response);
    await updateQuizAnswerAiGrading(answerId, {
      status: "graded",
      scorePercent,
      rationale,
      gradedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`AI grading failed for quiz answer ${answerId}:`, err);
    await updateQuizAnswerAiGrading(answerId, {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

// Entry point invoked via next/server's after() from submitQuizAction, so it
// runs post-response without blocking the student's redirect. Grades
// sequentially (not Promise.all) to stay comfortably under the Gemini free
// tier's per-minute request cap for quizzes with several free_text
// questions, and to keep the whole call within the route's maxDuration.
export async function gradeSubmissionFreeTextAnswers(submissionId: string): Promise<void> {
  const answers = await getQuizAnswersForSubmission(submissionId);
  const pending = answers.filter((a) => a.aiGradingStatus === "pending");
  if (pending.length === 0) return;

  for (const answer of pending) {
    const question = await getQuizQuestionById(answer.questionId);
    if (!question || question.type !== "free_text") {
      // Shouldn't happen (aiGradingStatus is only "pending" for free_text
      // answers) — surfaces as a failed grade rather than silently skipping.
      await updateQuizAnswerAiGrading(answer.id, {
        status: "failed",
        error: "Could not find this question's rubric/model answer.",
      });
      continue;
    }
    await gradeAnswerById(answer.id, question, answer.freeTextResponse ?? "");
  }

  await recomputeSubmissionScore(submissionId);
}

// Used by the teacher review page's "Retry AI grading" action for a single
// answer stuck in aiGradingStatus:"failed" — called synchronously from an
// already-authenticated admin request, unlike the deferred submission path.
export async function retryAiGradingForAnswer(answerId: string): Promise<void> {
  const answer = await getQuizAnswerById(answerId);
  if (!answer) return;

  const question = await getQuizQuestionById(answer.questionId);
  if (!question || question.type !== "free_text") {
    await updateQuizAnswerAiGrading(answerId, {
      status: "failed",
      error: "Could not find this question's rubric/model answer.",
    });
    return;
  }

  await gradeAnswerById(answerId, question, answer.freeTextResponse ?? "");
  await recomputeSubmissionScore(answer.submissionId);
}
