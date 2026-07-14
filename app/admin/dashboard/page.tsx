import { Newspaper, Briefcase, Inbox, FileText } from "lucide-react";
import { getArticles } from "@/lib/db/articles";
import { getJobs } from "@/lib/db/jobs";
import { getInquiries } from "@/lib/db/inquiries";
import { getApplications } from "@/lib/db/applications";
import { getSession } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/roles";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role as Role;

  const [articles, jobs, inquiries, applications] = await Promise.all([
    getArticles(),
    getJobs(),
    getInquiries(),
    getApplications(),
  ]);

  const unreadInquiries = inquiries.filter((i) => !i.read).length;
  const openJobs = jobs.filter((j) => j.status === "open").length;

  const allCards = [
    {
      label: "Published articles",
      value: articles.length,
      icon: Newspaper,
      href: "/admin/articles",
      roles: ["super_admin", "content_editor"] as Role[],
    },
    {
      label: "Open positions",
      value: openJobs,
      icon: Briefcase,
      href: "/admin/jobs",
      roles: ["super_admin", "hr_recruiter"] as Role[],
    },
    {
      label: "Unread inquiries",
      value: unreadInquiries,
      icon: Inbox,
      href: "/admin/inquiries",
      roles: ["super_admin"] as Role[],
    },
    {
      label: "Applications received",
      value: applications.length,
      icon: FileText,
      href: "/admin/applications",
      roles: ["super_admin", "hr_recruiter"] as Role[],
    },
  ];

  const cards = allCards.filter((card) => card.roles.includes(role));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
      <p className="mt-1 text-brand-gray">Overview of Cyber PolCo&apos;s website activity.</p>

      {cards.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.label}
                href={card.href}
                className="rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <Icon className="text-brand-blue" size={22} />
                <p className="mt-4 text-3xl font-bold text-brand-dark">{card.value}</p>
                <p className="mt-1 text-sm text-brand-gray">{card.label}</p>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-black/15 p-6 text-sm text-brand-gray">
          Nothing to show for your role yet.
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-dashed border-black/15 p-6 text-sm text-brand-gray">
        <strong className="text-brand-dark">Note:</strong> once analytics tracking is connected
        (see README.md → Future Scalability), page view and article-share stats can be added
        here too.
      </div>
    </div>
  );
}
