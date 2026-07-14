export default function Meter({ label, percent }: { label: string; percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand-dark dark:text-white">{label}</span>
        <span className="text-brand-gray dark:text-white/60">{clamped}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-blue/15 dark:bg-brand-blue/20">
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
