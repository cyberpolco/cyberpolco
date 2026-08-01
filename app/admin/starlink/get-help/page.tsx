import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { requestTechnicianHelpAction } from "@/lib/actions/starlink";
import HelpRequestButton from "./_components/HelpRequestButton";

export default async function GetHelpPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "starlink_client") redirect("/admin/dashboard");

  const client = session.linkedId ? await getStarlinkClientById(session.linkedId) : undefined;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Get Help / Obtenir de l&apos;aide</h1>

      <div className="mt-2 max-w-md space-y-1 text-brand-gray dark:text-white/60">
        <p>Need help with your Starlink service? Request a callback from our technician team.</p>
        <p className="italic">
          Besoin d&apos;aide avec votre service Starlink ? Demandez un rappel de notre équipe technique.
        </p>
      </div>

      {!client ? (
        <p className="mt-8 max-w-md rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Your account isn&apos;t linked to a Starlink client record yet. Contact your administrator.
          <br />
          <span className="italic">
            Votre compte n&apos;est pas encore lié à un dossier client Starlink. Contactez votre administrateur.
          </span>
        </p>
      ) : client.helpRequestedAt ? (
        <div className="mt-10 flex flex-col items-center">
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-status-good/15">
            <CheckCircle2 size={72} className="help-sent-pop-in text-status-good" />
          </div>
          <div className="mt-6 max-w-md space-y-1 text-sm">
            <p className="font-medium text-brand-dark dark:text-white">
              A technician will contact you shortly. Request sent{" "}
              {new Date(client.helpRequestedAt).toLocaleString()}.
            </p>
            <p className="italic text-brand-gray dark:text-white/60">
              Un technicien vous contactera sous peu. Demande envoyée le{" "}
              {new Date(client.helpRequestedAt).toLocaleString()}.
            </p>
          </div>
        </div>
      ) : (
        <form action={requestTechnicianHelpAction} className="mt-10">
          <HelpRequestButton />
        </form>
      )}
    </div>
  );
}
