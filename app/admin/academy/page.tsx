import Link from "next/link";
import { BookOpen, Users } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";

const sections = [
  {
    href: "/admin/academy/courses",
    label: "Courses",
    description: "Build courses with modules and lessons.",
    icon: BookOpen,
  },
  {
    href: "/admin/academy/students",
    label: "Students",
    description: "Enroll students, track progress, and issue certificates.",
    icon: Users,
  },
];

export default async function AcademyHubPage() {
  await requireRole(["super_admin"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Cyber PolCo Academy</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Manage the structured course platform and enrollments.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-brand-dark dark:text-white">{s.label}</h2>
              <p className="mt-2 text-sm text-brand-gray dark:text-white/60">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
