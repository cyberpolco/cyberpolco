import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { gradeFreeTextAnswer } from "./ai-grading";
import type { FreeTextQuestion } from "@/lib/db/academy";

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function geminiTextResponse(text: string) {
  return jsonResponse({ candidates: [{ content: { parts: [{ text }] } }] });
}

const question: FreeTextQuestion = {
  id: "q1",
  type: "free_text",
  text: "Explain the principle of least privilege.",
  rubric: "Mentions restricting access to only what's needed.",
  modelAnswer: "Least privilege means granting only the access necessary to perform a task, nothing more.",
};

describe("gradeFreeTextAnswer", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  it("throws if GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(gradeFreeTextAnswer(question, "some answer")).rejects.toThrow(/GEMINI_API_KEY is not set/);
  });

  it("parses a valid score/rationale response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(geminiTextResponse(JSON.stringify({ scorePercent: 80, rationale: "Covers the key idea." })))
    );

    const result = await gradeFreeTextAnswer(question, "Only give access to what's strictly needed.");
    expect(result).toEqual({ scorePercent: 80, rationale: "Covers the key idea." });
  });

  it("rounds a non-integer score", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(geminiTextResponse(JSON.stringify({ scorePercent: 66.6, rationale: "Partially correct." })))
    );

    const result = await gradeFreeTextAnswer(question, "Somewhat related answer.");
    expect(result.scorePercent).toBe(67);
  });

  it("throws when the API responds with a non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("rate limited", { status: 429 })));
    await expect(gradeFreeTextAnswer(question, "answer")).rejects.toThrow(/Gemini API request failed \(429\)/);
  });

  it("throws when the response text isn't valid JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiTextResponse("not json")));
    await expect(gradeFreeTextAnswer(question, "answer")).rejects.toThrow(/non-JSON output/);
  });

  it("throws when the parsed JSON doesn't match the expected shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(geminiTextResponse(JSON.stringify({ score: 80 }))));
    await expect(gradeFreeTextAnswer(question, "answer")).rejects.toThrow(/unexpected shape/);
  });

  it("throws when scorePercent is out of range", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(geminiTextResponse(JSON.stringify({ scorePercent: 150, rationale: "..." })))
    );
    await expect(gradeFreeTextAnswer(question, "answer")).rejects.toThrow(/unexpected shape/);
  });

  it("throws when the response has no candidates text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ candidates: [] })));
    await expect(gradeFreeTextAnswer(question, "answer")).rejects.toThrow(/did not contain the expected text output/);
  });

  it("sends the question's rubric, model answer, and the student's response in the prompt", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(geminiTextResponse(JSON.stringify({ scorePercent: 100, rationale: "Great answer." })));
    vi.stubGlobal("fetch", fetchMock);

    await gradeFreeTextAnswer(question, "Grant only the access strictly required.");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("generativelanguage.googleapis.com");
    expect(url).toContain("key=test-key");
    const body = JSON.parse(options.body);
    const prompt: string = body.contents[0].parts[0].text;
    expect(prompt).toContain(question.text);
    expect(prompt).toContain(question.rubric);
    expect(prompt).toContain(question.modelAnswer);
    expect(prompt).toContain("Grant only the access strictly required.");
  });
});
