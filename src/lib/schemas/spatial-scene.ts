// Zod schema for validating the incoming SpatialScene JSON —
// the format produced by the LLM / seed data loader.

import { z } from "zod";
import { ModuleType, ModuleStatus } from "@/lib/types";

// ─── Property sub-schemas ────────────────────────────────────────────────────

const lightPropertiesSchema = z.object({
  intensity: z.number().min(0).max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"),
});

const sensorPropertiesSchema = z.object({
  sensorType: z.enum(["temperature", "humidity", "motion", "light", "co2"]),
  value: z.number(),
  unit: z.string(),
  lastUpdated: z.string(),
});

const furniturePropertiesSchema = z.object({
  furnitureType: z.enum([
    "desk",
    "sofa",
    "bed",
    "chair",
    "table",
    "wardrobe",
    "plant",
  ]),
});

const modulePropertiesSchema = z.union([
  lightPropertiesSchema,
  sensorPropertiesSchema,
  furniturePropertiesSchema,
]);

// ─── Room schema ─────────────────────────────────────────────────────────────

const roomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

// ─── Module schema ────────────────────────────────────────────────────────────

const moduleSchema = z.object({
  id: z.string().min(1),
  uuid: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(ModuleType),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  status: z.nativeEnum(ModuleStatus),
  powerLimit: z.number().int().positive().nullable().optional(),
  properties: modulePropertiesSchema,
  metadata: z.record(z.string(), z.unknown()).default({}),
  roomId: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ─── SpatialScene schema ─────────────────────────────────────────────────────

export const spatialSceneSchema = z.object({
  room: roomSchema,
  modules: z.array(moduleSchema),
});

export type ValidatedSpatialScene = z.infer<typeof spatialSceneSchema>;
