// Prisma seed script: upserts the sample SpatialScene into the database.
// Run with: npx prisma db seed
// (tsx resolves @/ path aliases via the root tsconfig.json)

import { PrismaClient, ModuleType, ModuleStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SEED_SPATIAL_SCENE } from "../src/lib/seed-data";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString)
  throw new Error("DIRECT_URL or DATABASE_URL must be set");

// Use direct connection for seeding (bypasses PgBouncer transaction-mode limits)
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const { room, modules } = SEED_SPATIAL_SCENE;

  // Upsert room first (modules have a FK to it)
  await prisma.room.upsert({
    where: { id: room.id },
    update: { name: room.name, width: room.width, height: room.height },
    create: {
      id: room.id,
      name: room.name,
      width: room.width,
      height: room.height,
    },
  });

  // Upsert each module sequentially to preserve FK constraint
  for (const mod of modules) {
    await prisma.module.upsert({
      where: { id: mod.id },
      update: {
        uuid: mod.uuid,
        name: mod.name,
        type: mod.type as ModuleType,
        status: mod.status as ModuleStatus,
        x: mod.x,
        y: mod.y,
        width: mod.width,
        height: mod.height,
        rotation: mod.rotation,
        powerLimit: mod.powerLimit ?? null,
        properties: mod.properties as object,
        metadata: mod.metadata as object,
      },
      create: {
        id: mod.id,
        uuid: mod.uuid,
        name: mod.name,
        type: mod.type as ModuleType,
        status: mod.status as ModuleStatus,
        x: mod.x,
        y: mod.y,
        width: mod.width,
        height: mod.height,
        rotation: mod.rotation,
        powerLimit: mod.powerLimit ?? null,
        properties: mod.properties as object,
        metadata: mod.metadata as object,
        roomId: room.id,
      },
    });
  }

  console.log(`✅  Seeded: 1 room + ${modules.length} modules`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
