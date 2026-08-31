"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toDatetimeLocalValue } from "@/lib/academy/quiz";
import type { Quiz } from "@/lib/db/academy";

type QuestionType = "multiple_choice" | "multiple_select" | "free_text";

type QuestionRow =
  | { key: string; id?: string; type: "multiple_choice"; text: string; options: string[]; correctOptionIndex: number }
  | { key: string; id?: string; type: "multiple_select"; text: string; options: string[]; correctOptionIndexes: number[] }
  | { key: string; id?: string; type: "free_text"; text: string; rubric: string; modelAnswer: string };

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple choice (single answer)",
  multiple_select: "Multiple select (all-or-nothing)",
  free_text: "Free text (AI graded)",
};

// Self-contained: manages its own question/option state and renders the
// namePrefix_-scoped hidden/named inputs upsertAcademyCourseAction's
// parseQuiz expects. Sits inside CourseForm's outer <form> — native form
// submission picks these fields up regardless of component boundaries, so
// there's no need to thread this state through CourseForm's own.
export default function QuizEditor({
  namePrefix,
  label,
  quiz,
}: {
  namePrefix: string;
  label: string;
  quiz?: Quiz | null;
}) {
  const counter = useRef(0);
  const [questions, setQuestions] = useState<QuestionRow[]>(() =>
    (quiz?.questions ?? []).map((q) => ({ key: q.id, ...q }))
  );

  function addQuestion() {
    counter.current += 1;
    setQuestions((qs) => [
      ...qs,
      {
        key: `new-question-${counter.current}`,
        type: "multiple_choice",
        text: "",
        options: ["", ""],
        correctOptionIndex: 0,
      },
    ]);
  }

  function removeQuestion(key: string) {
    setQuestions((qs) => qs.filter((q) => q.key !== key));
  }

  // Loose patch typing (like the original single-type version) — each call
  // site only ever patches fields that belong to the row's current type.
  function updateQuestion(key: string, patch: Record<string, unknown>) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? ({ ...q, ...patch } as QuestionRow) : q)));
  }

  // Switching type discards the old type's fields (options/correctOption(es)
  // vs rubric/modelAnswer don't carry over) but keeps id/text so an
  // in-progress question isn't lost.
  function changeQuestionType(key: string, type: QuestionType) {
    setQuestions((qs) =>
      qs.map((q): QuestionRow => {
        if (q.key !== key) return q;
        const shared = { key: q.key, id: q.id, text: q.text };
        if (type === "multiple_choice") return { ...shared, type, options: ["", ""], correctOptionIndex: 0 };
        if (type === "multiple_select") return { ...shared, type, options: ["", ""], correctOptionIndexes: [] };
        return { ...shared, type, rubric: "", modelAnswer: "" };
      })
    );
  }

  function addOption(key: string) {
    setQuestions((qs) =>
      qs.map((q) => (q.key === key && "options" in q ? { ...q, options: [...q.options, ""] } : q))
    );
  }

  function removeOption(key: string, index: number) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key || !("options" in q)) return q;
        const options = q.options.filter((_, i) => i !== index);
        if (q.type === "multiple_choice") {
          return { ...q, options, correctOptionIndex: q.correctOptionIndex === index ? 0 : q.correctOptionIndex };
        }
        return {
          ...q,
          options,
          correctOptionIndexes: q.correctOptionIndexes
            .filter((i) => i !== index)
            .map((i) => (i > index ? i - 1 : i)),
        };
      })
    );
  }

  function toggleMultipleSelectCorrect(key: string, index: number) {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.key !== key || q.type !== "multiple_select") return q;
        const correctOptionIndexes = q.correctOptionIndexes.includes(index)
          ? q.correctOptionIndexes.filter((i) => i !== index)
          : [...q.correctOptionIndexes, index];
        return { ...q, correctOptionIndexes };
      })
    );
  }

  return (
    <div className="rounded-xl border border-brand-blue/30 dark:border-brand-blue/40 bg-brand-blue/5 dark:bg-brand-blue/10 p-4">
      <input type="hidden" name={`${namePrefix}_id`} value={quiz?.id ?? ""} />
      <input type="hidden" name={`${namePrefix}_questionCount`} value={questions.length} />

      <h4 className="text-xs font-bold uppercase tracking-wide text-brand-blue">{label}</h4>

      <div className="mt-2 flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">Title</label>
          <input
            name={`${namePrefix}_title`}
            defaultValue={quiz?.title}
            placeholder={`${label} title`}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">
            Available from
          </label>
          <input
            type="datetime-local"
            name={`${namePrefix}_availableAt`}
            defaultValue={toDatetimeLocalValue(quiz?.availableAt ?? null)}
            className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
        Leave the date blank to keep this hidden from students — it only becomes accessible once scheduled.
      </p>

      <div className="mt-3 space-y-3">
        {questions.map((q, qi) => (
          <div key={q.key} className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 p-3">
            <input type="hidden" name={`${namePrefix}_question_${qi}_id`} value={q.id ?? ""} />
            <input type="hidden" name={`${namePrefix}_question_${qi}_type`} value={q.type} />
            {"options" in q && (
              <input type="hidden" name={`${namePrefix}_question_${qi}_optionCount`} value={q.options.length} />
            )}

            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(q.key, { text: e.target.value })}
                  name={`${namePrefix}_question_${qi}_text`}
                  placeholder="Question"
                  rows={2}
                  className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
                />
                <select
                  value={q.type}
                  onChange={(e) => changeQuestionType(q.key, e.target.value as QuestionType)}
                  className="rounded-lg border border-black/10 dark:border-white/15 px-2 py-1 text-xs dark:bg-white/5 dark:text-white"
                >
                  {(Object.keys(TYPE_LABELS) as QuestionType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(q.key)}
                className="text-brand-red"
                aria-label="Remove question"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {(q.type === "multiple_choice" || q.type === "multiple_select") && (
              <div className="mt-2 space-y-1.5">
                {q.type === "multiple_select" && (
                  <p className="text-xs text-brand-gray dark:text-white/60">
                    Check every correct option — a student must select exactly this set for credit.
                  </p>
                )}
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    {q.type === "multiple_choice" ? (
                      <input
                        type="radio"
                        name={`${namePrefix}_question_${qi}_correctOption`}
                        value={oi}
                        checked={q.correctOptionIndex === oi}
                        onChange={() => updateQuestion(q.key, { correctOptionIndex: oi })}
                        title="Correct answer"
                        className="h-4 w-4"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        name={`${namePrefix}_question_${qi}_correctOptionIndexes`}
                        value={oi}
                        checked={q.correctOptionIndexes.includes(oi)}
                        onChange={() => toggleMultipleSelectCorrect(q.key, oi)}
                        title="Correct answer"
                        className="h-4 w-4"
                      />
                    )}
                    <input
                      value={opt}
                      onChange={(e) => {
                        const options = q.options.map((o, i) => (i === oi ? e.target.value : o));
                        updateQuestion(q.key, { options });
                      }}
                      name={`${namePrefix}_question_${qi}_option_${oi}`}
                      placeholder={`Option ${oi + 1}`}
                      className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm dark:bg-white/5 dark:text-white"
                    />
                    {q.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(q.key, oi)}
                        className="text-brand-red"
                        aria-label="Remove option"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(q.key)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-blue"
                >
                  <Plus size={12} /> Add option
                </button>
              </div>
            )}

            {q.type === "free_text" && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">
                    Grading rubric
                  </label>
                  <textarea
                    value={q.rubric}
                    onChange={(e) => updateQuestion(q.key, { rubric: e.target.value })}
                    name={`${namePrefix}_question_${qi}_rubric`}
                    placeholder="What should the AI look for in a good answer?"
                    rows={2}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">
                    Model answer
                  </label>
                  <textarea
                    value={q.modelAnswer}
                    onChange={(e) => updateQuestion(q.key, { modelAnswer: e.target.value })}
                    name={`${namePrefix}_question_${qi}_modelAnswer`}
                    placeholder="A strong example answer"
                    rows={2}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
                  />
                </div>
                <p className="text-xs text-brand-gray dark:text-white/60">
                  The rubric and model answer are sent to the AI grader; a teacher still reviews every AI-suggested
                  score before it counts.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addQuestion}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand-blue"
      >
        <Plus size={14} /> Add question
      </button>
    </div>
  );
}
