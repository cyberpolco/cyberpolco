"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/15 p-1 text-xs font-semibold">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={`rounded-full px-2.5 py-1 uppercase tracking-wide transition-colors ${
            loc === locale
              ? "bg-brand-yellow text-brand-dark"
              : "text-white/70 hover:text-white"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
