import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import SpeedTestRunner from "./_components/SpeedTestRunner";

export default async function SpeedTestPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "starlink_client") redirect("/admin/dashboard");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Speed Test</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Check your current connection speed.</p>

      <div className="mt-10">
        <SpeedTestRunner />
      </div>
    </div>
  );
}
