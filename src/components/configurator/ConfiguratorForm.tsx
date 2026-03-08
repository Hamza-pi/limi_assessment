"use client";

// Assembles all form sections for the configurator.
// Owns the RHF FormProvider so child field components can call useFormContext.
// Type-specific section (Light / Sensor) is rendered conditionally.

import { FormProvider } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useConfiguratorForm } from "@/hooks/useConfiguratorForm";
import { ModuleBaseFields } from "./ModuleBaseFields";
import { LightFields } from "./LightFields";
import { SensorFields } from "./SensorFields";
import { MetadataField } from "./MetadataField";
import { ModuleType } from "@/lib/types";
import type { Module } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfiguratorFormProps {
  module: Module;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfiguratorForm({ module, onClose }: ConfiguratorFormProps) {
  const { form, handleSubmit, isSubmitting } = useConfiguratorForm({
    module,
    onSuccess: onClose,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {/* Fields common to all module types */}
        <ModuleBaseFields />

        {/* Type-specific fields — Furniture has no additional properties */}
        {module.type !== ModuleType.FURNITURE && (
          <>
            <Separator />
            <div>
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {module.type === ModuleType.LIGHT
                  ? "Light Settings"
                  : "Sensor Settings"}
              </p>
              {module.type === ModuleType.LIGHT && <LightFields />}
              {module.type === ModuleType.SENSOR && <SensorFields />}
            </div>
          </>
        )}

        <Separator />

        {/* Custom metadata */}
        <MetadataField />

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
            data-testid="save-changes-btn"
            aria-label={isSubmitting ? "Saving changes…" : "Save changes"}
          >
            {isSubmitting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
