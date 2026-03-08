"use client";

// Encapsulates all React Hook Form logic for the module configurator.
// Derives sensible defaults from the selected Module and wires the
// Zod resolver so the form is validated before the server action fires.

import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  moduleFormSchema,
  type ModuleFormValues,
} from "@/lib/schemas/module-form";
import { useModuleActions } from "@/hooks/useModuleActions";
import { ModuleType } from "@/lib/types";
import type { Module, LightProperties, SensorProperties } from "@/lib/types";

// ─── Default value derivation ─────────────────────────────────────────────────

/**
 * Maps a Module from the store into the flat form value shape.
 * Type-specific properties (intensity, color, sensorType) are only populated
 * for the matching module type so Zod optional constraints are respected.
 */
function deriveFormDefaults(module: Module): ModuleFormValues {
  const props = module.properties as unknown as Record<string, unknown>;

  return {
    name: module.name,
    uuid: module.uuid,
    powerLimit: module.powerLimit,
    status: module.status,
    metadata: JSON.stringify(module.metadata ?? {}, null, 2),
    // Light-specific
    intensity:
      module.type === ModuleType.LIGHT
        ? (props.intensity as number)
        : undefined,
    color:
      module.type === ModuleType.LIGHT ? (props.color as string) : undefined,
    // Sensor-specific
    sensorType:
      module.type === ModuleType.SENSOR
        ? (props.sensorType as SensorProperties["sensorType"])
        : undefined,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseConfiguratorFormOptions {
  module: Module;
  /** Called after a successful submit — typically closes the Sheet */
  onSuccess: () => void;
}

export function useConfiguratorForm({
  module,
  onSuccess,
}: UseConfiguratorFormOptions) {
  const { updateModule } = useModuleActions();

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: deriveFormDefaults(module),
  });

  const onSubmit = useCallback(
    async (values: ModuleFormValues) => {
      await updateModule(module.id, values);
      onSuccess();
    },
    [module.id, updateModule, onSuccess],
  );

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
