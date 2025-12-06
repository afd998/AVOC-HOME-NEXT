import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import * as schema from "./schema";
import * as relations from "./relations";

// Load .env.local once from the first location that exists to avoid noisy logs
const ENV_FLAG = "__SHARED_DOTENV_LOADED__";
if (!process.env[ENV_FLAG]) {
  const envPaths = [
    path.resolve(__dirname, ".env.local"),
    path.resolve(__dirname, "../../.env.local"),
    path.resolve(__dirname, "../../../.env.local"),
    // Monorepo root (when consumers run from a workspace package)
    path.resolve(__dirname, "../../../../.env.local"),
    // Current working directory (e.g. Next.js app dir)
    path.resolve(process.cwd(), ".env.local"),
  ];
  const foundPath = envPaths.find((p) => fs.existsSync(p));
  if (foundPath) {
    dotenv.config({ path: foundPath });
  }
  process.env[ENV_FLAG] = "true";
}

// Reuse a single pool across hot reloads/build workers to avoid exhausting limited session-mode connections
declare global {
  // eslint-disable-next-line no-var
  var __sharedDbPool: Pool | undefined;
}

const pool =
  globalThis.__sharedDbPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase session mode can be very strict; default to 1 unless explicitly raised
    max: Number.parseInt(process.env.PG_POOL_MAX ?? process.env.PGPOOLSIZE ?? "1", 10),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

globalThis.__sharedDbPool = pool;

// Handle pool errors to prevent unhandled 'error' events from crashing the process
// This commonly happens when Supabase's pooler terminates idle connections
pool.on("error", (err) => {
  // Ignore expected shutdown/termination errors
  if (err.message?.includes("shutdown") || err.message?.includes("termination")) {
    return;
  }
  console.error("Unexpected database pool error:", err);
});

// Combine schema and relations for drizzle
const fullSchema = {
  ...schema,
  ...relations,
};

export const db = drizzle(pool, { schema: fullSchema });
export const pgPool = pool;
