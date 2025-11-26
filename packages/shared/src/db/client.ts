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

// Combine schema and relations for drizzle
const fullSchema = {
  ...schema,
  ...relations,
};

export const db = drizzle(pool, { schema: fullSchema });
export const pgPool = pool;
