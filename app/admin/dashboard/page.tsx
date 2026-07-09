import { Newspaper, Briefcase, Inbox, FileText } from "lucide-react";
import { getArticles } from "@/lib/db/articles";
import { getJobs } from "@/lib/db/jobs";
import { getInquiries } from "@/lib/db/inquiries";
import { getApplications } from "@/lib/db/applications";

export default async function DashboardPage() {
  const [articles, jobs, inquiries, applications] = await Promise.all([
    getArticles(),
    getJobs(),
    getInquiries(),
    getApplications(),
  ]);

  const unreadInquiries = inquiries.filter((i) => !i.read).length;
  const openJobs = jobs.filter((j) => j.status === "open").length;

  const cards = [
    { label: "Published articles", value: articles.length, icon: Newspaper, href: "/admin/articles" },
    { label: "Open positions", value: openJobs, icon: Briefcase, href: "/admin/jobs" },
    { label: "Unread inquiries", value: unreadInquiries, icon: Inbox, href: "/admin/inquiries" },
    { label: "Applications received", value: applications.length, icon: FileText, href: "/admin/applications" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>
      <p className="mt-1 text-brand-gray">Overview of Cyber PolCo&apos;s website activity.</p>

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

      <div className="mt-10 rounded-2xl border border-dashed border-black/15 p-6 text-sm text-brand-gray">
        <strong className="text-brand-dark">Note:</strong> this dashboard reads from the local
        JSON data store. Once you connect analytics (see README.md → Future Scalability), page
        view stats can be added here too.
      </div>
    </div>
  );
}
