import { existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Local dev reads `vercel env pull` output; Vercel builds already have the env.
// loadEnvFile never overrides a set var, so .env.local wins over .env.
for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Migrations need Neon's direct URL, not the pooler (SPEC §2).
  datasource: { url: process.env.DATABASE_URL_UNPOOLED },
});
