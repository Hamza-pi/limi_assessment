"use client";

// Sensor-specific form field: a Select for the sensor category.
// Only rendered when the selected module is a SENSOR.

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "./FieldError";
import type { ModuleFormValues } from "@/lib/schemas/module-form";

// ─── Sensor type options ──────────────────────────────────────────────────────

const SENSOR_OPTIONS = [
  { value: "temperature", label: "Temperature" },
  { value: "humidity", label: "Humidity" },
  { value: "motion", label: "Motion" },
  { value: "light", label: "Light Level" },
  { value: "co2", label: "CO₂" },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function SensorFields() {
  const {
    control,
    formState: { errors },
  } = useFormContext<ModuleFormValues>();

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="sensorType">Sensor Type</Label>
        <Controller
          name="sensorType"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger id="sensorType" aria-label="Select sensor type">
                <SelectValue placeholder="Select a sensor type" />
              </SelectTrigger>
              <SelectContent>
                {SENSOR_OPTIONS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError message={errors.sensorType?.message} />
      </div>
    </div>
  );
}
