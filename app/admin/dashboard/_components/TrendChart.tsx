"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsDarkMode } from "@/app/admin/_components/useIsDarkMode";

const BRAND_BLUE = "#626fda";

export default function TrendChart({
  title,
  data,
}: {
  title: string;
  data: { label: string; value: number }[];
}) {
  const isDark = useIsDarkMode();
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,18,32,0.08)";
  const axisColor = isDark ? "rgba(255,255,255,0.6)" : "#424242";
  const textColor = isDark ? "rgba(255,255,255,0.85)" : "#0f1220";

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">{title}</h3>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: axisColor }} axisLine={{ stroke: gridColor }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              contentStyle={{
                background: isDark ? "#2f3555" : "#ffffff",
                border: "none",
                borderRadius: 8,
                color: textColor,
                fontSize: 13,
              }}
            />
            <Area type="monotone" dataKey="value" stroke={BRAND_BLUE} fill={BRAND_BLUE} fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
