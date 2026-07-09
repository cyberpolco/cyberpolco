"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { AFRICA_ISO3 } from "@/lib/content/africa-iso3";
import { presenceCountries } from "@/lib/content/company";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COLORS = {
  physical: "#626fda",
  online: "#e69c3f",
  none: "#3a3f5c",
  hover: "#e3484f",
};

const COUNTRY_NAMES: Record<string, { fr: string; en: string }> = {
  COD: { fr: "République Démocratique du Congo", en: "Democratic Republic of Congo" },
  NAM: { fr: "Namibie", en: "Namibia" },
  ZAF: { fr: "Afrique du Sud", en: "South Africa" },
  AGO: { fr: "Angola", en: "Angola" },
};

export default function AfricaMap() {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("home");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const presenceByIso = useMemo(() => {
    const map = new Map<string, "physical" | "online">();
    presenceCountries.forEach((c) => map.set(c.iso, c.status));
    return map;
  }, []);

  function statusFor(iso: string) {
    return presenceByIso.get(iso);
  }

  function labelFor(iso: string, status: "physical" | "online" | undefined) {
    const name = COUNTRY_NAMES[iso]?.[locale] ?? iso;
    if (status === "physical") return `${name} — ${t("mapLegendPhysical")}`;
    if (status === "online") return `${name} — ${t("mapLegendOnline")}`;
    return `${name} — ${t("mapNotYet")}`;
  }

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-brand-dark-2/40"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projectionConfig={{ scale: 340, center: [20, 2] }}
          width={800}
          height={760}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => AFRICA_ISO3.includes(geo.id as string))
                .map((geo) => {
                  const iso = geo.id as string;
                  const status = statusFor(iso);
                  const fill =
                    status === "physical"
                      ? COLORS.physical
                      : status === "online"
                        ? COLORS.online
                        : COLORS.none;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#0f1220"
                      strokeWidth={0.6}
                      onMouseEnter={(evt) => {
                        setTooltip({
                          x: evt.clientX,
                          y: evt.clientY,
                          text: labelFor(iso, status),
                        });
                      }}
                      onMouseMove={(evt) => {
                        setTooltip((prev) =>
                          prev ? { ...prev, x: evt.clientX, y: evt.clientY } : prev
                        );
                      }}
                      onFocus={() =>
                        setTooltip({ x: 0, y: 0, text: labelFor(iso, status) })
                      }
                      tabIndex={0}
                      style={{
                        default: { outline: "none", transition: "fill 150ms" },
                        hover: { fill: COLORS.hover, outline: "none", cursor: "pointer" },
                        pressed: { fill: COLORS.hover, outline: "none" },
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ComposableMap>

        {tooltip && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-medium text-white shadow-xl"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-white/70">
        <LegendDot color={COLORS.physical} label={t("mapLegendPhysical")} />
        <LegendDot color={COLORS.online} label={t("mapLegendOnline")} />
        <LegendDot color={COLORS.none} label={t("mapNotYet")} />
      </div>

      {/* Accessible text-based fallback for screen readers / non-hover devices */}
      <ul className="sr-only">
        {presenceCountries.map((c) => (
          <li key={c.iso}>{labelFor(c.iso, c.status)}</li>
        ))}
      </ul>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
