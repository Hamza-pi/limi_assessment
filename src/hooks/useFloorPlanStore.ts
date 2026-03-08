// Zustand store for the floor plan with Immer for ergonomic immutable updates.
// Fine-grained selectors ensure that changing one module only re-renders
// that module's component — critical for scaling to 500+ modules.

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ModuleType, ModuleStatus } from "@/lib/types";
import type { Module, Room, SpatialScene, ModulePatch } from "@/lib/types";

// ─── State shape ─────────────────────────────────────────────────────────────

interface FloorPlanState {
  room: Room | null;
  /** Keyed by module ID for O(1) access — essential at 500+ modules */
  modules: Record<string, Module>;
  selectedModuleId: string | null;
  /** True when every LIGHT in the room is ON */
  isToggleAllOn: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

interface FloorPlanActions {
  /** Populate store from a SpatialScene — called once on client mount */
  initializeFromScene: (scene: SpatialScene) => void;
  /** Apply a partial patch to a single module */
  patchModule: (id: string, patch: ModulePatch) => void;
  /** Apply the same partial patch to many modules at once (e.g. Toggle All) */
  batchPatchModules: (ids: string[], patch: ModulePatch) => void;
  /** Update a sensor's live reading without touching other properties */
  updateSensorValue: (id: string, value: number) => void;
  /** Re-derive isToggleAllOn from the current modules map */
  syncToggleAllState: () => void;
  /** Open the configurator panel for the given module */
  selectModule: (id: string) => void;
  /** Close the configurator panel */
  deselectModule: () => void;
}

export type FloorPlanStore = FloorPlanState & FloorPlanActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFloorPlanStore = create<FloorPlanStore>()(
  immer((set, get) => ({
    // ── Initial state ─────────────────────────────────────────────────────────
    room: null,
    modules: {},
    selectedModuleId: null,
    isToggleAllOn: true,

    // ── Actions ───────────────────────────────────────────────────────────────
    initializeFromScene: (scene) =>
      set((state) => {
        state.room = scene.room;
        state.modules = Object.fromEntries(scene.modules.map((m) => [m.id, m]));

        const lights = scene.modules.filter((m) => m.type === ModuleType.LIGHT);
        state.isToggleAllOn =
          lights.length > 0 &&
          lights.every((m) => m.status === ModuleStatus.ON);
      }),

    patchModule: (id, patch) =>
      set((state) => {
        if (state.modules[id]) Object.assign(state.modules[id], patch);
      }),

    batchPatchModules: (ids, patch) =>
      set((state) => {
        for (const id of ids) {
          if (state.modules[id]) Object.assign(state.modules[id], patch);
        }
      }),

    updateSensorValue: (id, value) =>
      set((state) => {
        const mod = state.modules[id];
        if (!mod || mod.type !== ModuleType.SENSOR) return;

        const props = mod.properties as { value: number; lastUpdated: string };
        props.value = value;
        props.lastUpdated = new Date().toISOString();
      }),

    syncToggleAllState: () => {
      const lights = Object.values(get().modules).filter(
        (m) => m.type === ModuleType.LIGHT,
      );
      const allOn =
        lights.length > 0 && lights.every((m) => m.status === ModuleStatus.ON);
      set((state) => {
        state.isToggleAllOn = allOn;
      });
    },

    selectModule: (id) =>
      set((state) => {
        state.selectedModuleId = id;
      }),
    deselectModule: () =>
      set((state) => {
        state.selectedModuleId = null;
      }),
  })),
);
