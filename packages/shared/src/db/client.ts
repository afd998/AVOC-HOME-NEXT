import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as schema from "./schema";
import * as relations from "./relations";

// Try multiple possible .env.local locations
dotenv.config({ path: ".env.local" });
dotenv.config({ path: "../../.env.local" });
dotenv.config({ path: "../../../.env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
