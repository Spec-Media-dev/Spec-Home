import { Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <div className="container-content space-y-8 py-14">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-11 w-full max-w-2xl rounded-lg" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-72 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
