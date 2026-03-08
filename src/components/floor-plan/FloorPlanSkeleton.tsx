// Loading skeleton that mirrors the FloorPlanCanvas layout.
// Renders scattered module placeholders inside a fixed aspect-ratio container
// so there is no layout shift when real modules mount.

import { Skeleton } from "@/components/ui/skeleton";

// Approximate positions matching the seed scene (1200×900) — just for aesthetics.
const MODULE_PLACEHOLDERS = [
  { left: "15%", top: "9%", w: "7%", h: "9.5%" }, // light north
  { left: "64%", top: "74%", w: "7%", h: "9.5%" }, // light south
  { left: "82%", top: "19%", w: "5.5%", h: "7.5%" }, // desk lamp
  { left: "7%", top: "47%", w: "5.5%", h: "7.5%" }, // ambient strip
  { left: "45%", top: "42%", w: "7%", h: "9.5%" }, // pendant centre
  { left: "35%", top: "18%", w: "5.5%", h: "7.5%" }, // sensor 1
  { left: "65%", top: "35%", w: "5.5%", h: "7.5%" }, // sensor 2
  { left: "20%", top: "65%", w: "14%", h: "19%" }, // furniture sofa
];

export function FloorPlanSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-xl border border-border bg-card"
      style={{ aspectRatio: "1200 / 900" }}
    >
      {/* Matching grid overlay */}
      <div
        className="floor-plan-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {MODULE_PLACEHOLDERS.map((pos, i) => (
        <Skeleton
          key={i}
          className="absolute rounded-lg"
          style={{ left: pos.left, top: pos.top, width: pos.w, height: pos.h }}
        />
      ))}
    </div>
  );
}
