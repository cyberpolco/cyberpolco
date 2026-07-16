export default function ProgressBar({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden bg-brand-blue/10">
      <div className="fb-progress-bar h-full w-1/3 bg-brand-blue" />
    </div>
  );
}
