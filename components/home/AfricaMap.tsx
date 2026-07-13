"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { AFRICA_NUMERIC_TO_ISO3 } from "@/lib/content/africa-iso3";
import { presenceCountries } from "@/lib/content/company";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const COLORS = {
  physical: "#626fda",
  online: "#e69c3f",
  coming: "#e3484f",
  none: "#3a3f5c",
  hover: "#8890e8",
};

const COUNTRY_NAMES: Record<string, { fr: string; en: string }> = {
  DZA: { fr: "Algérie", en: "Algeria" },
  AGO: { fr: "Angola", en: "Angola" },
  BEN: { fr: "Bénin", en: "Benin" },
  BWA: { fr: "Botswana", en: "Botswana" },
  BFA: { fr: "Burkina Faso", en: "Burkina Faso" },
  BDI: { fr: "Burundi", en: "Burundi" },
  CMR: { fr: "Cameroun", en: "Cameroon" },
  CAF: { fr: "République centrafricaine", en: "Central African Republic" },
  TCD: { fr: "Tchad", en: "Chad" },
  COG: { fr: "Congo", en: "Congo" },
  COD: { fr: "République Démocratique du Congo", en: "Democratic Republic of Congo" },
  CIV: { fr: "Côte d'Ivoire", en: "Côte d'Ivoire" },
  DJI: { fr: "Djibouti", en: "Djibouti" },
  EGY: { fr: "Égypte", en: "Egypt" },
  GNQ: { fr: "Guinée équatoriale", en: "Equatorial Guinea" },
  ERI: { fr: "Érythrée", en: "Eritrea" },
  SWZ: { fr: "Eswatini", en: "Eswatini" },
  ETH: { fr: "Éthiopie", en: "Ethiopia" },
  GAB: { fr: "Gabon", en: "Gabon" },
  GMB: { fr: "Gambie", en: "Gambia" },
  GHA: { fr: "Ghana", en: "Ghana" },
  GIN: { fr: "Guinée", en: "Guinea" },
  GNB: { fr: "Guinée-Bissau", en: "Guinea-Bissau" },
  KEN: { fr: "Kenya", en: "Kenya" },
  LSO: { fr: "Lesotho", en: "Lesotho" },
  LBR: { fr: "Libéria", en: "Liberia" },
  LBY: { fr: "Libye", en: "Libya" },
  MDG: { fr: "Madagascar", en: "Madagascar" },
  MWI: { fr: "Malawi", en: "Malawi" },
  MLI: { fr: "Mali", en: "Mali" },
  MRT: { fr: "Mauritanie", en: "Mauritania" },
  MAR: { fr: "Maroc", en: "Morocco" },
  MOZ: { fr: "Mozambique", en: "Mozambique" },
  NAM: { fr: "Namibie", en: "Namibia" },
  NER: { fr: "Niger", en: "Niger" },
  NGA: { fr: "Nigeria", en: "Nigeria" },
  RWA: { fr: "Rwanda", en: "Rwanda" },
  SEN: { fr: "Sénégal", en: "Senegal" },
  SLE: { fr: "Sierra Leone", en: "Sierra Leone" },
  SOM: { fr: "Somalie", en: "Somalia" },
  ZAF: { fr: "Afrique du Sud", en: "South Africa" },
  SSD: { fr: "Soudan du Sud", en: "South Sudan" },
  SDN: { fr: "Soudan", en: "Sudan" },
  TZA: { fr: "Tanzanie", en: "Tanzania" },
  TGO: { fr: "Togo", en: "Togo" },
  TUN: { fr: "Tunisie", en: "Tunisia" },
  UGA: { fr: "Ouganda", en: "Uganda" },
  ZMB: { fr: "Zambie", en: "Zambia" },
  ZWE: { fr: "Zimbabwe", en: "Zimbabwe" },
  ESH: { fr: "Sahara occidental", en: "Western Sahara" },
};

export default function AfricaMap() {
  const locale = useLocale() as "fr" | "en";
  const t = useTranslations("home");
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const presenceByIso = useMemo(() => {
    const map = new Map<string, "physical" | "online" | "coming">();
    presenceCountries.forEach((c) => map.set(c.iso, c.status));
    return map;
  }, []);

  function statusFor(iso: string) {
    return presenceByIso.get(iso);
  }

  function labelFor(iso: string, status: "physical" | "online" | "coming" | undefined) {
    const name = COUNTRY_NAMES[iso]?.[locale] ?? iso;
    if (status === "physical") return `${name} — ${t("mapLegendPhysical")}`;
    if (status === "online") return `${name} — ${t("mapLegendOnline")}`;
    if (status === "coming") return `${name} — ${t("mapLegendComing")}`;
    return `${name} — ${t("mapNotYet")}`;
  }

  return (
    <div className="relative mx-auto max-w-xl">
      <div
        className="relative mx-auto overflow-hidden rounded-3xl border border-white/10 bg-brand-dark-2/40"
        onMouseLeave={() => setTooltip(null)}
      >
        <ComposableMap
          projectionConfig={{ scale: 470, center: [20, 2] }}
          width={720}
          height={800}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies
                .filter((geo) => (geo.id as string) in AFRICA_NUMERIC_TO_ISO3)
                .map((geo) => {
                  const iso = AFRICA_NUMERIC_TO_ISO3[geo.id as string];
                  const status = statusFor(iso);
                  const fill =
                    status === "physical"
                      ? COLORS.physical
                      : status === "online"
                        ? COLORS.online
                        : status === "coming"
                          ? COLORS.coming
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
            className="pointer-events-none fixed z-[60] rounded-lg bg-brand-dark px-3 py-1.5 text-xs font-medium text-white shadow-xl"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-5 text-sm text-white/70">
        <LegendDot color={COLORS.physical} label={t("mapLegendPhysical")} />
        <LegendDot color={COLORS.online} label={t("mapLegendOnline")} />
        <LegendDot color={COLORS.coming} label={t("mapLegendComing")} />
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
