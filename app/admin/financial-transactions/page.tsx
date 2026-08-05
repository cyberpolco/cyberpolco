import { requireRole } from "@/lib/auth/rbac";
import { getAllPawaPayTransactions, getPaymentsStats, type PawaPayTransaction } from "@/lib/db/payments";
import { getStarlinkClients } from "@/lib/db/starlink";
import { getAcademyEnrollments, getAcademyCourses } from "@/lib/db/academy";
import PaymentStatusTiles from "@/app/admin/dashboard/_components/PaymentStatusTiles";
import TransactionsTable, { type ResolvedTransaction } from "./_components/TransactionsTable";

export default async function FinancialTransactionsPage() {
  const session = await requireRole(["super_admin", "technician", "teacher"]);
  const scope =
    session.role === "technician" ? "starlink_subscription" : session.role === "teacher" ? "academy_fee" : undefined;

  const [allTransactions, stats, clients, enrollments, courses] = await Promise.all([
    getAllPawaPayTransactions(),
    getPaymentsStats(scope),
    getStarlinkClients(),
    getAcademyEnrollments(),
    getAcademyCourses(),
  ]);

  const transactions = scope ? allTransactions.filter((t) => t.referenceType === scope) : allTransactions;

  // Resolved once from bulk-fetched clients/enrollments/courses, so each row
  // resolves to a name/product label in O(1) rather than a query per row.
  const siteById = new Map(clients.flatMap((c) => c.sites.map((s) => [s.id, { client: c, site: s }])));
  const enrollmentById = new Map(enrollments.map((e) => [e.id, e]));
  const courseById = new Map(courses.map((c) => [c.id, c]));

  function resolveTransaction(t: PawaPayTransaction): ResolvedTransaction {
    const base = {
      id: t.id,
      pawapayId: t.pawapayId,
      type: t.type,
      status: t.status,
      amount: t.amount,
      currency: t.currency,
      payerMsisdn: t.payerMsisdn,
      referenceType: t.referenceType,
      createdAt: t.createdAt,
    };

    if (t.referenceType === "starlink_subscription" && t.referenceId) {
      const match = siteById.get(t.referenceId);
      if (match) {
        return { ...base, personName: match.client.name, personType: "Starlink", productLabel: match.site.siteName };
      }
    }
    if (t.referenceType === "academy_fee" && t.referenceId) {
      const enrollment = enrollmentById.get(t.referenceId);
      if (enrollment) {
        const course = courseById.get(enrollment.courseId);
        return {
          ...base,
          personName: enrollment.studentName,
          personType: "Academy",
          productLabel: course?.en.title ?? "—",
        };
      }
    }
    return { ...base, personName: "—", personType: "Unlinked", productLabel: "—" };
  }

  const resolved: ResolvedTransaction[] = transactions.map(resolveTransaction);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Financial Transactions</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        {scope === "starlink_subscription"
          ? "All Starlink subscription payments."
          : scope === "academy_fee"
            ? "All Academy enrollment-fee payments."
            : "Every PawaPay transaction across Starlink and Academy."}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <p className="text-3xl font-bold text-brand-dark dark:text-white">{stats.totalCollectedLabel}</p>
          <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Total collected</p>
        </div>
        <div className="sm:col-span-1 lg:col-span-2">
          <PaymentStatusTiles tiles={stats.byStatus} />
        </div>
      </div>

      <div className="mt-6">
        <TransactionsTable transactions={resolved} canReconcile={session.role === "super_admin"} />
      </div>
    </div>
  );
}
