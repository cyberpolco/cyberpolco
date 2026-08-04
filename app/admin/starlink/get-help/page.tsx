import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { requestTechnicianHelpAction } from "@/lib/actions/starlink";
import { formatDateTime } from "@/lib/utils/date-format";
import HelpRequestButton from "./_components/HelpRequestButton";

export default async function GetHelpPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "starlink_client") redirect("/admin/dashboard");

  const client = session.linkedId ? await getStarlinkClientById(session.linkedId) : undefined;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Get Help / Obtenir de l&apos;aide</h1>

      <div className="mt-2 max-w-md space-y-1 text-brand-gray dark:text-white/60">
        <p>Select the site that needs help to request a callback from our technician team.</p>
        <p className="italic">
          Sélectionnez le site qui a besoin d&apos;aide pour demander un rappel de notre équipe technique.
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
      ) : client.sites.length === 0 ? (
        <p className="mt-8 max-w-md rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          No sites on file yet. / Aucun site enregistré pour le moment.
        </p>
      ) : (
        <div className="mt-10 flex flex-wrap justify-center gap-10">
          {client.sites.map((site) => (
            <div key={site.id} className="flex flex-col items-center">
              <p className="mb-3 font-medium text-brand-dark dark:text-white">{site.siteName}</p>

              {site.helpRequestedAt ? (
                <div className="flex flex-col items-center">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-status-good/15">
                    <CheckCircle2 size={56} className="help-sent-pop-in text-status-good" />
                  </div>
                  <div className="mt-4 max-w-[14rem] space-y-1 text-xs">
                    <p className="font-medium text-brand-dark dark:text-white">
                      Sent {formatDateTime(site.helpRequestedAt)}
                    </p>
                    <p className="italic text-brand-gray dark:text-white/60">
                      Envoyé le {formatDateTime(site.helpRequestedAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <form action={requestTechnicianHelpAction}>
                  <input type="hidden" name="siteId" value={site.id} />
                  <HelpRequestButton />
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
