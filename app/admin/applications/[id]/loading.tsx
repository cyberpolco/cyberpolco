import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-3xl">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-7 w-1/2" />
      <div className="mt-6 rounded-2xl border border-black/5 p-6 dark:border-white/10">
        <SkeletonText lines={4} />
      </div>
    </div>
  );
}
