"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useIsDarkMode } from "@/app/admin/_components/useIsDarkMode";

export default function DonutChart({
  title,
  data,
  colors,
}: {
  title: string;
  data: { label: string; value: number }[];
  colors: string[];
}) {
  const isDark = useIsDarkMode();
  const textColor = isDark ? "rgba(255,255,255,0.85)" : "#0f1220";
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">{title}</h3>
      {hasData ? (
        <div className="mt-2 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {data.map((entry, i) => (
                  <Cell key={entry.label} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 13, color: textColor }} />
              <Tooltip
                contentStyle={{
                  background: isDark ? "#2f3555" : "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  color: textColor,
                  fontSize: 13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-4 text-sm text-brand-gray dark:text-white/60">Not enough data yet.</p>
      )}
    </div>
  );
}
