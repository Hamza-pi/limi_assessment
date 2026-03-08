// Type guards and icon helpers for the three module types.
// Guards narrow the generic Module type to a variant with typed properties,
// enabling safe property access without casting throughout the codebase.

import {
  Lightbulb,
  Thermometer,
  Droplets,
  Activity,
  Wind,
  Sun,
  Monitor,
  Armchair,
  BedDouble,
  Table2,
  Package,
  Leaf,
  type LucideIcon,
} from "lucide-react";
import { ModuleType } from "@/lib/types";
import type {
  Module,
  LightProperties,
  SensorProperties,
  FurnitureProperties,
} from "@/lib/types";

// ─── Type guards ─────────────────────────────────────────────────────────────

export type LightModule = Module & {
  type: ModuleType.LIGHT;
  properties: LightProperties;
};
export type SensorModule = Module & {
  type: ModuleType.SENSOR;
  properties: SensorProperties;
};
export type FurnitureModule = Module & {
  type: ModuleType.FURNITURE;
  properties: FurnitureProperties;
};

export const isLightModule = (m: Module): m is LightModule =>
  m.type === ModuleType.LIGHT;
export const isSensorModule = (m: Module): m is SensorModule =>
  m.type === ModuleType.SENSOR;
export const isFurnitureModule = (m: Module): m is FurnitureModule =>
  m.type === ModuleType.FURNITURE;

// ─── Sensor icons ─────────────────────────────────────────────────────────────

const SENSOR_ICON_MAP: Record<SensorProperties["sensorType"], LucideIcon> = {
  temperature: Thermometer,
  humidity: Droplets,
  motion: Activity,
  co2: Wind,
  light: Sun,
};

export function getSensorIcon(
  sensorType: SensorProperties["sensorType"],
): LucideIcon {
  return SENSOR_ICON_MAP[sensorType] ?? Activity;
}

// ─── Furniture icons ──────────────────────────────────────────────────────────

const FURNITURE_ICON_MAP: Record<
  FurnitureProperties["furnitureType"],
  LucideIcon
> = {
  desk: Monitor,
  sofa: Armchair,
  bed: BedDouble,
  chair: Armchair,
  table: Table2,
  wardrobe: Package,
  plant: Leaf,
};

export function getFurnitureIcon(
  furnitureType: FurnitureProperties["furnitureType"],
): LucideIcon {
  return FURNITURE_ICON_MAP[furnitureType] ?? Package;
}

// ─── Light colour helper ──────────────────────────────────────────────────────

/**
 * Derives a Tailwind/CSS glow shadow from light intensity and hex colour.
 * Returns undefined when the light is fully dimmed so no glow is rendered.
 */
export function getLightGlowStyle(
  intensity: number,
  color: string,
): string | undefined {
  if (intensity <= 0) return undefined;
  const alpha = Math.round((intensity / 100) * 0.7 * 255)
    .toString(16)
    .padStart(2, "0");
  return `0 0 ${Math.max(8, intensity / 4)}px 3px ${color}${alpha}`;
}
