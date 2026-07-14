import Link from "next/link";
import { Newspaper, Briefcase, Inbox, FileText, Eye, Share2, GraduationCap, Users, Award, SatelliteDish } from "lucide-react";
import { getArticles, getTopArticlesByViews, getTopArticlesByShares } from "@/lib/db/articles";
import { getJobs } from "@/lib/db/jobs";
import { getInquiries } from "@/lib/db/inquiries";
import { getApplications } from "@/lib/db/applications";
import { getStarlinkClientById, getStarlinkStats } from "@/lib/db/starlink";
import { getAcademyEnrollmentById, getAcademyCourseById, getAcademyStats } from "@/lib/db/academy";
import { getSession } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/roles";
import RankedBarList from "./_components/RankedBarList";
import StarlinkViewerDashboard from "./_components/StarlinkViewerDashboard";
import AcademyViewerDashboard from "./_components/AcademyViewerDashboard";
import Meter from "./_components/Meter";
import PaymentStatusTiles from "./_components/PaymentStatusTiles";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session?.role as Role;

  if (role === "viewer" && session?.viewerType === "starlink_client") {
    const client = session.linkedId ? await getStarlinkClientById(session.linkedId) : undefined;
    return <StarlinkViewerDashboard client={client} />;
  }

  if (role === "viewer" && session?.viewerType === "academy_student") {
    const enrollment = session.linkedId ? await getAcademyEnrollmentById(session.linkedId) : undefined;
    const course = enrollment ? await getAcademyCourseById(enrollment.courseId) : undefined;
    return <AcademyViewerDashboard enrollment={enrollment} course={course} />;
  }

  const [articles, jobs, inquiries, applications, topByViews, topByShares] = await Promise.all([
    getArticles(),
    getJobs(),
    getInquiries(),
    getApplications(),
    getTopArticlesByViews(5),
    getTopArticlesByShares(5),
  ]);

  const unreadInquiries = inquiries.filter((i) => !i.read).length;
  const openJobs = jobs.filter((j) => j.status === "open").length;
  const totalViews = articles.reduce((sum, a) => sum + (a.viewCount ?? 0), 0);
  const totalShares = articles.reduce((sum, a) => sum + (a.shareCount ?? 0), 0);

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
    {
      label: "Total article views",
      value: totalViews,
      icon: Eye,
      href: "/admin/articles",
      roles: ["super_admin", "content_editor", "hr_recruiter"] as Role[],
    },
    {
      label: "Total article shares",
      value: totalShares,
      icon: Share2,
      href: "/admin/articles",
      roles: ["super_admin", "content_editor", "hr_recruiter"] as Role[],
    },
  ];

  const cards = allCards.filter((card) => card.roles.includes(role));

  const [academyStats, starlinkStats] =
    role === "super_admin" ? await Promise.all([getAcademyStats(), getStarlinkStats()]) : [undefined, undefined];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Dashboard</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Overview of Cyber PolCo&apos;s website activity.</p>

      {cards.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.label}
                href={card.href}
                className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
              >
                <Icon className="text-brand-blue" size={22} />
                <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{card.value}</p>
                <p className="mt-1 text-sm text-brand-gray dark:text-white/60">{card.label}</p>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Nothing to show for your role yet.
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <RankedBarList
          title="Most read articles"
          colorClassName="bg-brand-blue"
          items={topByViews.map((a) => ({ label: a.en.title, value: a.viewCount ?? 0 }))}
        />
        <RankedBarList
          title="Most shared articles"
          colorClassName="bg-brand-yellow"
          items={topByShares.map((a) => ({ label: a.en.title, value: a.shareCount ?? 0 }))}
        />
      </div>

      {academyStats && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark dark:text-white">
            <GraduationCap size={20} className="text-brand-blue" /> Academy
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-3">
            <Link
              href="/admin/academy/courses"
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <GraduationCap className="text-brand-blue" size={22} />
              <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{academyStats.totalCourses}</p>
              <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Courses</p>
            </Link>
            <Link
              href="/admin/academy/students"
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <Users className="text-brand-blue" size={22} />
              <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{academyStats.totalStudents}</p>
              <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Enrolled students</p>
            </Link>
            <Link
              href="/admin/academy/students"
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <Award className="text-brand-blue" size={22} />
              <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{academyStats.certificatesIssued}</p>
              <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Certificates issued</p>
            </Link>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
              <Meter label="Average student progress" percent={academyStats.averageProgress} />
            </div>
            <RankedBarList
              title="Enrollments by course"
              colorClassName="bg-brand-blue"
              items={academyStats.enrollmentsByCourse}
            />
          </div>
        </div>
      )}

      {starlinkStats && (
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-brand-dark dark:text-white">
            <SatelliteDish size={20} className="text-brand-blue" /> Starlink
          </h2>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Link
              href="/admin/starlink"
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <Users className="text-brand-blue" size={22} />
              <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{starlinkStats.totalClients}</p>
              <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Clients</p>
            </Link>
            <Link
              href="/admin/starlink"
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <SatelliteDish className="text-brand-blue" size={22} />
              <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{starlinkStats.totalSites}</p>
              <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Sites</p>
            </Link>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
              Payment status
            </p>
            <PaymentStatusTiles
              paid={starlinkStats.paymentBreakdown.paid}
              pending={starlinkStats.paymentBreakdown.pending}
              overdue={starlinkStats.paymentBreakdown.overdue}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <RankedBarList
              title="Sites by installation status"
              colorClassName="bg-brand-blue"
              items={starlinkStats.installationByStatus}
            />
            <RankedBarList
              title="Sites by deployment status"
              colorClassName="bg-brand-blue"
              items={starlinkStats.deploymentByStatus}
            />
            <RankedBarList
              title="Sites by subscription type"
              colorClassName="bg-brand-blue"
              items={starlinkStats.subscriptionByType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
