"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toDatetimeLocalValue } from "@/lib/academy/quiz";
import type { Quiz } from "@/lib/db/academy";

type QuestionRow = {
  key: string;
  id?: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
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
    (quiz?.questions ?? []).map((q) => ({ key: q.id, id: q.id, text: q.text, options: q.options, correctOptionIndex: q.correctOptionIndex }))
  );

  function addQuestion() {
    counter.current += 1;
    setQuestions((qs) => [
      ...qs,
      { key: `new-question-${counter.current}`, text: "", options: ["", ""], correctOptionIndex: 0 },
    ]);
  }

  function removeQuestion(key: string) {
    setQuestions((qs) => qs.filter((q) => q.key !== key));
  }

  function updateQuestion(key: string, patch: Partial<QuestionRow>) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  }

  function addOption(key: string) {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, options: [...q.options, ""] } : q)));
  }

  function removeOption(key: string, index: number) {
    setQuestions((qs) =>
      qs.map((q) =>
        q.key === key
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== index),
              correctOptionIndex: q.correctOptionIndex === index ? 0 : q.correctOptionIndex,
            }
          : q
      )
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
            <input type="hidden" name={`${namePrefix}_question_${qi}_optionCount`} value={q.options.length} />

            <div className="flex items-start gap-2">
              <textarea
                value={q.text}
                onChange={(e) => updateQuestion(q.key, { text: e.target.value })}
                name={`${namePrefix}_question_${qi}_text`}
                placeholder="Question"
                rows={2}
                className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
              />
              <button
                type="button"
                onClick={() => removeQuestion(q.key)}
                className="text-brand-red"
                aria-label="Remove question"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`${namePrefix}_question_${qi}_correctOption`}
                    value={oi}
                    checked={q.correctOptionIndex === oi}
                    onChange={() => updateQuestion(q.key, { correctOptionIndex: oi })}
                    title="Correct answer"
                    className="h-4 w-4"
                  />
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
