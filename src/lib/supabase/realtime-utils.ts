// Utility types and pure functions for processing Supabase Realtime
// postgres_changes payloads from the `modules` table.
//
// Isolated from the hook so these helpers are individually testable and so
// any future Supabase API changes have a single point of impact.

import { ModuleStatus } from "@/lib/types";
import type { Module, ModulePatch, SensorProperties } from "@/lib/types";

// ─── Payload type ─────────────────────────────────────────────────────────────

/**
 * Shape of a row as delivered by Supabase Realtime postgres_changes.
 * Mirrors the Prisma `Module` model — field names are stored verbatim in
 * PostgreSQL because no `@map` directives are used in schema.prisma.
 */
export type ModuleRow = {
  id: string;
  uuid: string;
  name: string;
  type: string; // plain string — not the TS enum union
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  status: string; // plain string — cast to ModuleStatus on use
  powerLimit: number | null;
  properties: Record<string, unknown>;
  metadata: Record<string, unknown>;
  roomId: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Builds a `ModulePatch` from a Realtime row, scoped to fields that
 * legitimately change at runtime. Position, IDs and timestamps are excluded.
 */
export function toModulePatch(row: ModuleRow): ModulePatch {
  return {
    name: row.name,
    status: row.status as ModuleStatus,
    powerLimit: row.powerLimit,
    properties: row.properties as unknown as Module["properties"],
    metadata: row.metadata as Module["metadata"],
  };
}

/**
 * Safely extracts the numeric sensor reading from a raw properties blob.
 * Returns `null` when the value is absent or non-finite.
 */
export function getSensorValue(
  properties: Record<string, unknown>,
): number | null {
  const raw = (properties as Partial<SensorProperties>).value;
  return typeof raw === "number" && isFinite(raw) ? raw : null;
}
