import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { withVerifiedTls } from "@/lib/database-url";
import { PrismaClient } from "@/lib/generated/prisma/client";

// One module-level pool on the pooled URL, released cleanly by Vercel Fluid (SPEC §2).
// Cached on globalThis so dev hot reloads don't open a new pool each time.
const globalForDb = globalThis as unknown as { db?: PrismaClient };

export const db = globalForDb.db ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const pool = new Pool({ connectionString: withVerifiedTls(connectionString), idleTimeoutMillis: 5000 });
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}
