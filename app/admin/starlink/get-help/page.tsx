import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { requestTechnicianHelpAction } from "@/lib/actions/starlink";
import SubmitButton from "@/app/admin/_components/SubmitButton";

export default async function GetHelpPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "starlink_client") redirect("/admin/dashboard");

  const client = session.linkedId ? await getStarlinkClientById(session.linkedId) : undefined;

  return (
    <div className="max-w-lg">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-dark dark:text-white">
        <LifeBuoy className="text-brand-blue" size={24} />
        Get Help / Obtenir de l&apos;aide
      </h1>

      <div className="mt-2 space-y-1 text-brand-gray dark:text-white/60">
        <p>Need help with your Starlink service? Request a callback from our technician team.</p>
        <p className="italic">
          Besoin d&apos;aide avec votre service Starlink ? Demandez un rappel de notre équipe technique.
        </p>
      </div>

      {!client ? (
        <p className="mt-6 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Your account isn&apos;t linked to a Starlink client record yet. Contact your administrator.
          <br />
          <span className="italic">
            Votre compte n&apos;est pas encore lié à un dossier client Starlink. Contactez votre administrateur.
          </span>
        </p>
      ) : (
        <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          {client.helpRequestedAt ? (
            <div className="space-y-1 text-sm text-brand-dark dark:text-white">
              <p className="font-medium">
                A technician will contact you shortly. Request sent {new Date(client.helpRequestedAt).toLocaleString()}.
              </p>
              <p className="italic text-brand-gray dark:text-white/60">
                Un technicien vous contactera sous peu. Demande envoyée le{" "}
                {new Date(client.helpRequestedAt).toLocaleString()}.
              </p>
            </div>
          ) : (
            <form action={requestTechnicianHelpAction}>
              <SubmitButton pendingLabel="Sending... / Envoi en cours...">
                Request technician help / Demander l&apos;aide d&apos;un technicien
              </SubmitButton>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
