"use client";

// Hydrates the Zustand store from server-fetched SpatialScene data.
// Placed in the component tree before any floor-plan components so the
// store is populated before they first render. Renders no DOM output.

import { useEffect, useRef } from "react";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import type { SpatialScene } from "@/lib/types";

interface StoreInitializerProps {
  scene: SpatialScene;
}

export function StoreInitializer({ scene }: StoreInitializerProps) {
  const initialized = useRef(false);
  const initializeFromScene = useFloorPlanStore((s) => s.initializeFromScene);

  useEffect(() => {
    // Guard against Strict Mode double-invocation and future re-renders
    if (initialized.current) return;
    initializeFromScene(scene);
    initialized.current = true;
  }, [scene, initializeFromScene]);

  return null;
}
