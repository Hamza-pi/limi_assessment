"use client";

// Common fields shared across all module types: name, UUID, power limit, status.
// Uses useFormContext so the parent ConfiguratorForm owns the FormProvider.

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FieldError } from "./FieldError";
import type { ModuleFormValues } from "@/lib/schemas/module-form";

export function ModuleBaseFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ModuleFormValues>();

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g. Ceiling Light A"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* UUID */}
      <div className="space-y-1.5">
        <Label htmlFor="uuid">UUID (Hardware MAC)</Label>
        <Input
          id="uuid"
          {...register("uuid")}
          placeholder="A4:CF:12:2D:C5:01"
          className="font-mono text-sm"
          aria-invalid={!!errors.uuid}
          aria-describedby={errors.uuid ? "uuid-error" : undefined}
        />
        <FieldError message={errors.uuid?.message} />
      </div>

      {/* Power Limit */}
      <div className="space-y-1.5">
        <Label htmlFor="powerLimit">Power Limit (W)</Label>
        <Input
          id="powerLimit"
          type="number"
          min={1}
          {...register("powerLimit", {
            setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
          })}
          placeholder="e.g. 60"
          aria-invalid={!!errors.powerLimit}
        />
        <FieldError message={errors.powerLimit?.message} />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <Label htmlFor="status" className="cursor-pointer">
          Status
        </Label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              id="status"
              checked={field.value === "ON"}
              onCheckedChange={(checked) =>
                field.onChange(checked ? "ON" : "OFF")
              }
              aria-label="Toggle module status"
            />
          )}
        />
      </div>
    </div>
  );
}
