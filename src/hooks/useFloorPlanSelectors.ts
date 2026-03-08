// Stable Zustand selectors for the floor plan store.
// Importing named selectors (instead of inline lambdas) gives referential
// stability across renders and avoids unnecessary re-subscriptions.

import { ModuleType } from "@/lib/types";
import type { FloorPlanStore } from "@/hooks/useFloorPlanStore";

// ─── Single-module selector ───────────────────────────────────────────────────

/**
 * Returns a selector for one module by ID.
 * Because it accesses only `state.modules[id]`, React only re-renders
 * the subscribing component when *that specific module* changes.
 *
 * Usage:
 *   const module = useFloorPlanStore(selectModuleById(id))
 */
export const selectModuleById = (id: string) => (state: FloorPlanStore) =>
  state.modules[id];

// ─── Module-list selectors ────────────────────────────────────────────────────

/** All module IDs — used by FloorPlanCanvas to render the full grid */
export const selectAllModuleIds = (state: FloorPlanStore): string[] =>
  Object.keys(state.modules);

/** Module IDs filtered by type — used by MasterControls for counts */
export const selectModuleIdsByType =
  (type: ModuleType) =>
  (state: FloorPlanStore): string[] =>
    Object.values(state.modules)
      .filter((m) => m.type === type)
      .map((m) => m.id);

// ─── Aggregate / UI selectors ─────────────────────────────────────────────────

/** Selected module object (or undefined if nothing is selected) */
export const selectSelectedModule = (state: FloorPlanStore) =>
  state.selectedModuleId ? state.modules[state.selectedModuleId] : undefined;

/** Module counts by type — { lights, sensors, furniture } */
export const selectModuleCounts = (state: FloorPlanStore) => {
  const all = Object.values(state.modules);
  return {
    lights: all.filter((m) => m.type === ModuleType.LIGHT).length,
    sensors: all.filter((m) => m.type === ModuleType.SENSOR).length,
    furniture: all.filter((m) => m.type === ModuleType.FURNITURE).length,
  };
};
