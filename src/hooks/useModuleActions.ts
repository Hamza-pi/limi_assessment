// Async module actions with optimistic UI updates.
// Each action: 1) applies an optimistic state change immediately,
//              2) calls the Server Action in the background,
//              3) rolls back on failure.
//
// State is accessed via useFloorPlanStore.getState() inside callbacks
// so these hooks never create reactive subscriptions of their own.

import { useCallback } from "react";
import { useFloorPlanStore } from "@/hooks/useFloorPlanStore";
import {
  toggleModuleAction,
  toggleAllLightsAction,
  updateModuleAction,
} from "@/lib/actions/modules";
import { ModuleStatus, ModuleType } from "@/lib/types";
import type { ModuleFormValues } from "@/lib/schemas/module-form";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useModuleActions() {
  const patchModule = useFloorPlanStore((s) => s.patchModule);
  const batchPatchModules = useFloorPlanStore((s) => s.batchPatchModules);
  const syncToggleAllState = useFloorPlanStore((s) => s.syncToggleAllState);

  // ── Toggle a single module ON / OFF ────────────────────────────────────────
  const toggleModule = useCallback(
    async (id: string) => {
      const mod = useFloorPlanStore.getState().modules[id];
      if (!mod) return;

      const prevStatus = mod.status;
      const nextStatus =
        prevStatus === ModuleStatus.ON ? ModuleStatus.OFF : ModuleStatus.ON;

      patchModule(id, { status: nextStatus }); // optimistic
      const result = await toggleModuleAction(id, nextStatus);

      if (!result.success) {
        patchModule(id, { status: prevStatus }); // rollback
        console.error("[toggleModule] rollback:", result.error);
      }

      syncToggleAllState();
    },
    [patchModule, syncToggleAllState],
  );

  // ── Toggle all LIGHT modules ON / OFF ──────────────────────────────────────
  const toggleAllLights = useCallback(async () => {
    const { modules, isToggleAllOn, room } = useFloorPlanStore.getState();
    if (!room) return;

    const nextStatus = isToggleAllOn ? ModuleStatus.OFF : ModuleStatus.ON;
    const lights = Object.values(modules).filter(
      (m) => m.type === ModuleType.LIGHT,
    );
    const lightIds = lights.map((m) => m.id);
    // Capture individual statuses for a granular rollback
    const snapshot = lights.map((m) => ({ id: m.id, status: m.status }));

    batchPatchModules(lightIds, { status: nextStatus }); // optimistic
    syncToggleAllState();

    const result = await toggleAllLightsAction(room.id, nextStatus);

    if (!result.success) {
      for (const { id, status } of snapshot) patchModule(id, { status }); // rollback
      syncToggleAllState();
      console.error("[toggleAllLights] rollback:", result.error);
    }
  }, [patchModule, batchPatchModules, syncToggleAllState]);

  // ── Update module config from the configurator form ────────────────────────
  const updateModule = useCallback(
    async (id: string, values: ModuleFormValues) => {
      const mod = useFloorPlanStore.getState().modules[id];
      if (!mod) return;

      // Snapshot for rollback
      const snapshot = {
        name: mod.name,
        uuid: mod.uuid,
        powerLimit: mod.powerLimit,
        status: mod.status,
        metadata: mod.metadata,
      };

      patchModule(id, {
        // optimistic
        name: values.name,
        uuid: values.uuid,
        powerLimit: values.powerLimit,
        status: values.status,
        metadata: values.metadata ? JSON.parse(values.metadata) : {},
      });

      const result = await updateModuleAction(id, values);

      if (!result.success) {
        patchModule(id, snapshot); // rollback
        console.error("[updateModule] rollback:", result.error);
      }
    },
    [patchModule],
  );

  return { toggleModule, toggleAllLights, updateModule };
}
