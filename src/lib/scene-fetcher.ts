// Server-only data fetching for the floor plan page.
// Transforms Prisma models (with Date objects and JsonValue) into plain
// SpatialScene types that are safe to serialise and pass to Client Components.
// Falls back to seed data if the database has no rooms yet.

import { prisma } from "@/lib/prisma";
import { SEED_SPATIAL_SCENE } from "@/lib/seed-data";
import { ModuleStatus, ModuleType } from "@/lib/types";
import type { SpatialScene, Module, Room } from "@/lib/types";
import type {
  Module as PrismaModule,
  Room as PrismaRoom,
} from "@prisma/client";

// ─── Transformers ─────────────────────────────────────────────────────────────

function transformRoom(row: PrismaRoom): Room {
  return { id: row.id, name: row.name, width: row.width, height: row.height };
}

function transformModule(row: PrismaModule): Module {
  return {
    id: row.id,
    uuid: row.uuid,
    name: row.name,
    type: row.type as ModuleType,
    status: row.status as ModuleStatus,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    rotation: row.rotation,
    powerLimit: row.powerLimit,
    properties: row.properties as unknown as Module["properties"],
    metadata: row.metadata as Record<string, unknown>,
    roomId: row.roomId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches the first room and its modules from the DB.
 * Returns the SEED_SPATIAL_SCENE as a fallback if the DB is empty or unreachable.
 */
export async function fetchSpatialScene(): Promise<SpatialScene> {
  try {
    const room = await prisma.room.findFirst({
      include: { modules: { orderBy: { createdAt: "asc" } } },
    });

    if (!room) return SEED_SPATIAL_SCENE;

    return {
      room: transformRoom(room),
      modules: room.modules.map(transformModule),
    };
  } catch (err) {
    console.error("[fetchSpatialScene] DB unavailable — using seed data:", err);
    return SEED_SPATIAL_SCENE;
  }
}
