// Prisma v7 client singleton — uses @prisma/adapter-pg driver adapter.
// The adapter is created once and reused across hot-reloads in development.
// See: https://pris.ly/d/prisma7-client-config

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString =
    process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables");
  }

  // Pooled connection URL (port 6543 with pgbouncer=true) for runtime queries
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  // Persist across hot-reloads to avoid exhausting the connection pool
  globalForPrisma.prisma = prisma;
}
