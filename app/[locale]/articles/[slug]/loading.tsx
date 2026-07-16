import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-6 h-64 w-full" />
      <div className="mt-8">
        <SkeletonText lines={6} />
      </div>
    </article>
  );
}
