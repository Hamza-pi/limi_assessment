// Core domain types for the Limi AI Dynamic Layout Engine.
// These mirror the Prisma models but are plain TypeScript interfaces
// safe to use in both client and server code.

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ModuleType {
  LIGHT = "LIGHT",
  SENSOR = "SENSOR",
  FURNITURE = "FURNITURE",
}

export enum ModuleStatus {
  ON = "ON",
  OFF = "OFF",
}

// ─── Module Properties (type-discriminated) ──────────────────────────────────

export interface LightProperties {
  intensity: number; // 0–100 percentage
  color: string; // hex colour string e.g. "#FFD700"
}

export interface SensorProperties {
  sensorType: "temperature" | "humidity" | "motion" | "light" | "co2";
  value: number;
  unit: string; // "°C", "%RH", "ppm", "lux", ""
  lastUpdated: string; // ISO 8601 date string
}

export interface FurnitureProperties {
  furnitureType:
    | "desk"
    | "sofa"
    | "bed"
    | "chair"
    | "table"
    | "wardrobe"
    | "plant";
}

export type ModuleProperties =
  | LightProperties
  | SensorProperties
  | FurnitureProperties;

// ─── Core Models ─────────────────────────────────────────────────────────────

export interface Module {
  id: string;
  uuid: string; // hardware MAC address — XX:XX:XX:XX:XX:XX
  name: string;
  type: ModuleType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  status: ModuleStatus;
  powerLimit: number | null;
  properties: ModuleProperties;
  metadata: Record<string, unknown>;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  width: number; // logical floor plan width in pixels
  height: number; // logical floor plan height in pixels
}

// ─── SpatialScene (LLM output / seed schema) ─────────────────────────────────

export interface SpatialScene {
  room: Room;
  modules: Module[];
}

// ─── Utility Types ────────────────────────────────────────────────────────────

/** Subset of module fields that can be patched through the UI */
export type ModulePatch = Partial<
  Pick<
    Module,
    | "name"
    | "uuid"
    | "status"
    | "powerLimit"
    | "properties"
    | "metadata"
    | "x"
    | "y"
  >
>;
