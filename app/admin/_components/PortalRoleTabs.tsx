"use client";

export default function PortalRoleTabs({
  adminLabel,
  clientLabel,
  studentLabel,
  active,
  onChange,
}: {
  adminLabel: string;
  clientLabel: string;
  studentLabel: string;
  active: number;
  onChange: (index: number) => void;
}) {
  const roles = [adminLabel, clientLabel, studentLabel];

  return (
    <div className="mt-5 grid grid-cols-3 gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
      {roles.map((role, i) => (
        <button
          key={role}
          type="button"
          onClick={() => onChange(i)}
          className={`rounded-md px-2 py-1.5 text-center text-xs font-semibold transition-colors ${
            active === i
              ? "bg-white text-brand-dark shadow-sm"
              : "text-brand-gray hover:text-brand-dark dark:text-white/60 dark:hover:text-white"
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
