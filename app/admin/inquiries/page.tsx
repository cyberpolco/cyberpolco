import { getInquiries } from "@/lib/db/inquiries";
import { toggleInquiryReadAction } from "@/lib/actions/inquiries";
import { requireRole } from "@/lib/auth/rbac";

export default async function InquiriesPage() {
  await requireRole(["super_admin"]);

  const inquiries = await getInquiries();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Inquiries</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Contact form submissions from the website.</p>

      <div className="mt-6 space-y-4">
        {inquiries.map((inq) => (
          <div
            key={inq.id}
            className={`rounded-2xl border p-6 ${
              inq.read ? "border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2" : "border-brand-blue/30 bg-brand-blue/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-dark dark:text-white">
                  {inq.name} · {inq.company} ({inq.position})
                </p>
                <p className="text-sm text-brand-gray dark:text-white/60">{inq.email}</p>
                <p className="mt-2 text-sm font-medium text-brand-dark dark:text-white">{inq.subject}</p>
              </div>
              <form action={toggleInquiryReadAction}>
                <input type="hidden" name="id" value={inq.id} />
                <input type="hidden" name="nextState" value={(!inq.read).toString()} />
                <button
                  type="submit"
                  className="rounded-full border border-black/10 dark:border-white/15 px-3 py-1 text-xs font-semibold text-brand-gray dark:text-white/60 hover:border-brand-blue hover:text-brand-blue"
                >
                  {inq.read ? "Mark unread" : "Mark read"}
                </button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-brand-gray dark:text-white/60">{inq.message}</p>
            <p className="mt-3 text-xs text-brand-gray/70 dark:text-white/50">
              {new Date(inq.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        {inquiries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-10 text-center text-brand-gray dark:text-white/60">
            No inquiries yet.
          </div>
        )}
      </div>
    </div>
  );
}
