"use client";

// Light-specific form fields: brightness intensity (0–100 slider) and
// hex colour temperature. Only rendered when the selected module is a LIGHT.

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FieldError } from "./FieldError";
import type { ModuleFormValues } from "@/lib/schemas/module-form";

export function LightFields() {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<ModuleFormValues>();

  const intensity = watch("intensity") ?? 0;
  const color = watch("color") ?? "";

  return (
    <div className="space-y-5">
      {/* Intensity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Intensity</Label>
          <span className="tabular-nums text-xs text-muted-foreground">
            {intensity}%
          </span>
        </div>
        <Controller
          name="intensity"
          control={control}
          render={({ field }) => (
            <Slider
              min={0}
              max={100}
              step={1}
              value={[field.value ?? 0]}
              onValueChange={([v]) => field.onChange(v)}
              aria-label={`Brightness intensity: ${intensity}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={intensity}
            />
          )}
        />
        <FieldError message={errors.intensity?.message} />
      </div>

      {/* Colour temperature */}
      <div className="space-y-1.5">
        <Label htmlFor="color">Colour Temperature (hex)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="color"
            {...register("color")}
            placeholder="#FFD700"
            className="font-mono text-sm"
            aria-invalid={!!errors.color}
          />
          {/* Live colour preview swatch */}
          <div
            className="h-9 w-9 shrink-0 rounded border border-border transition-colors"
            style={{
              backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(color)
                ? color
                : "transparent",
            }}
            aria-hidden="true"
          />
        </div>
        <FieldError message={errors.color?.message} />
      </div>
    </div>
  );
}
