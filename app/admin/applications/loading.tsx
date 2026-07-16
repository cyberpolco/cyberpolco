import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, col) => (
          <div key={col} className="flex w-64 shrink-0 flex-col gap-2 rounded-2xl bg-brand-dark-2/5 p-3 dark:bg-white/5">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 3 }).map((_, row) => (
              <Skeleton key={row} className="h-20 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
