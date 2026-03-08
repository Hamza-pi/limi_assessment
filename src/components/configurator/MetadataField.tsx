"use client";

// Custom JSON metadata textarea — validates that the content is parseable
// JSON before the form is submitted (enforced by the Zod schema refine).

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "./FieldError";
import type { ModuleFormValues } from "@/lib/schemas/module-form";

export function MetadataField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ModuleFormValues>();

  return (
    <div className="space-y-1.5">
      <Label htmlFor="metadata">Custom Metadata (JSON)</Label>
      <Textarea
        id="metadata"
        {...register("metadata")}
        placeholder='{"key": "value"}'
        className="min-h-[88px] resize-none font-mono text-xs"
        aria-invalid={!!errors.metadata}
        aria-label="Custom metadata as JSON"
      />
      <FieldError message={errors.metadata?.message} />
    </div>
  );
}
