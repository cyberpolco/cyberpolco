import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/2" />
      <div className="mt-8">
        <SkeletonText lines={5} />
      </div>
    </div>
  );
}
