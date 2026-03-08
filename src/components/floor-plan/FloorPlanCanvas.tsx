"use client";

// Main 2D floor plan canvas.
// Renders all modules as absolutely-positioned nodes inside a responsive
// container whose aspect ratio mirrors the logical room dimensions.
// Module IDs are memoised so the list only updates when the set of modules changes.

import React, { useMemo } from "react";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import { selectAllModuleIds } from "@/hooks/useFloorPlanSelectors";
import { getRoomAspectRatio } from "@/lib/floor-plan-utils";
import { ModuleNode } from "./ModuleNode";
import { useShallow } from "zustand/react/shallow";

export function FloorPlanCanvas() {
  const room = useFloorPlanStore((s) => s.room);
  const moduleIds = useFloorPlanStore(useShallow(selectAllModuleIds));

  // Stabilise the ID list: only re-derive when membership changes, not on
  // individual module property updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableIds = useMemo(() => moduleIds, [moduleIds.join(",")]);

  if (!room) return null;

  return (
    <section
      aria-label={`Floor plan — ${room.name}`}
      role="application"
      className="relative w-full overflow-hidden rounded-xl border border-border bg-card"
      style={{ aspectRatio: getRoomAspectRatio(room) }}
    >
      {/* Subtle grid overlay */}
      <div
        className="floor-plan-grid pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Module nodes */}
      {stableIds.map((id) => (
        <ModuleNode key={id} id={id} room={room} />
      ))}

      {/* Room metadata label */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 right-3 select-none font-mono text-xs text-muted-foreground/50"
      >
        {room.name} · {room.width}×{room.height}
      </span>
    </section>
  );
}
