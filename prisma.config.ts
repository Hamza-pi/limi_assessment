// Prisma v7 configuration file.
// - datasource.url  → used by `prisma migrate dev/deploy/reset`
// - Runtime adapter → configured in src/lib/prisma.ts via PrismaPg
// See: https://pris.ly/d/config-datasource

import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
