// Next.js route-level loading state.
// Automatically shown by the App Router while the RSC page.tsx is streaming.
// Mirrors the real page layout so there is no cumulative layout shift (CLS = 0).

import { MasterControlsSkeleton } from "@/components/floor-plan/MasterControlsSkeleton";
import { FloorPlanSkeleton } from "@/components/floor-plan/FloorPlanSkeleton";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col gap-4 bg-background p-4 md:p-6">
      {/* Skip nav — same as real page so focus state is preserved */}
      <a
        href="#floor-plan"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-primary focus:p-2 focus:text-primary-foreground"
      >
        Skip to floor plan
      </a>

      {/* Page heading */}
      <div className="flex items-baseline gap-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-primary">
          Limi AI
        </h2>
        <span className="text-xs text-muted-foreground">Layout Engine</span>
      </div>

      {/* Skeleton controls bar */}
      <MasterControlsSkeleton />

      {/* Skeleton floor plan */}
      <div id="floor-plan" className="w-full">
        <FloorPlanSkeleton />
      </div>
    </main>
  );
}
