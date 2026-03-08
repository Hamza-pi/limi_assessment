// Loading skeleton that mirrors the MasterControls layout.
// Shown by Next.js Suspense / loading.tsx while the RSC is streaming.

import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function MasterControlsSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
    >
      {/* Room name placeholder */}
      <Skeleton className="h-4 w-28" />

      <Separator orientation="vertical" className="h-5" />

      {/* Badge placeholders */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <Separator orientation="vertical" className="h-5" />

      {/* Toggle All placeholder */}
      <div className="ml-auto flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-11 rounded-full" />
      </div>
    </div>
  );
}
