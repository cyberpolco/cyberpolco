import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NextStep } from "@/lib/academy/sequence";

export default function NextStepLink({ step, enrollmentId }: { step: NextStep; enrollmentId: string }) {
  if (step.type === "none") return null;

  const href =
    step.type === "lesson"
      ? `/admin/academy/my-courses/${enrollmentId}/modules/${step.moduleId}/lessons/${step.lessonId}`
      : `/admin/academy/my-courses/${enrollmentId}/quiz/${step.quizId}`;

  return (
    <Link
      href={href}
      className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue/90"
    >
      {step.label} <ArrowRight size={14} />
    </Link>
  );
}
