export function TextInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

export function TextArea({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">{title}</h2>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function LocaleColumn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-brand-gray dark:text-white/60">{label}</p>
      {children}
    </div>
  );
}
