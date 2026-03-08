// Zod schema for the module configurator form (React Hook Form + Zod resolver).
// Enforces hardware UUID format and business rules for power limits.

import { z } from "zod";
import { ModuleStatus } from "@/lib/types";

// Hardware MAC address pattern — e.g. A4:CF:12:2D:C5:01
const MAC_ADDRESS_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

// ─── Schema ───────────────────────────────────────────────────────────────────

export const moduleFormSchema = z.object({
  // ── Core fields ──────────────────────────────────────────────────────────────
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer"),

  uuid: z
    .string()
    .regex(
      MAC_ADDRESS_REGEX,
      "UUID must follow the hardware format XX:XX:XX:XX:XX:XX",
    ),

  powerLimit: z
    .number({ error: "Power limit must be a number" })
    .int("Power limit must be a whole number")
    .positive("Power limit must be greater than zero")
    .nullable(),

  status: z.nativeEnum(ModuleStatus),

  // Custom JSON metadata — validated as a parseable JSON string
  metadata: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, "Metadata must be valid JSON"),
  // Default is supplied by deriveFormDefaults in useConfiguratorForm

  // ── Light-specific (optional — only rendered for LIGHT modules) ───────────────
  intensity: z.number().min(0).max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex colour")
    .optional(),

  // ── Sensor-specific (optional — only rendered for SENSOR modules) ─────────────
  sensorType: z
    .enum(["temperature", "humidity", "motion", "light", "co2"])
    .optional(),
});

export type ModuleFormValues = z.infer<typeof moduleFormSchema>;
