// RSC — fetches the SpatialScene from the DB (falls back to seed data),
// then renders the floor plan UI with Server Components where possible
// and injects data into the client-side Zustand store.

import { fetchSpatialScene } from "@/lib/scene-fetcher";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { MasterControls } from "@/components/floor-plan/MasterControls";
import { FloorPlanCanvas } from "@/components/floor-plan/FloorPlanCanvas";
import { ConfiguratorSheetLoader } from "@/components/configurator/ConfiguratorSheetLoader";

export const dynamic = "force-dynamic"; // always fetch fresh data; no stale cache

export default async function HomePage() {
  const scene = await fetchSpatialScene();

  return (
    // StoreInitializer MUST appear before MasterControls/FloorPlanCanvas so
    // the Zustand store is hydrated before any client component first renders.
    <>
      <StoreInitializer scene={scene} />

      <main className="flex min-h-screen flex-col gap-4 bg-background p-4 md:p-6">
        {/* Skip navigation for accessibility */}
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

        {/* Controls bar */}
        <RealtimeProvider>
          <MasterControls />

          {/* 2D floor plan canvas */}
          <div id="floor-plan" className="w-full">
            <FloorPlanCanvas />
          </div>

          {/* Slide-over configurator — rendered at root level so it layers
              above the canvas regardless of which module triggered it */}
          <ConfiguratorSheetLoader />
        </RealtimeProvider>
      </main>
    </>
  );
}
