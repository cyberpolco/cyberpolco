import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-7 w-1/3" />
      <div className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
        <SkeletonText lines={5} />
        <Skeleton className="mt-6 h-11 w-32 rounded-full" />
      </div>
    </div>
  );
}
