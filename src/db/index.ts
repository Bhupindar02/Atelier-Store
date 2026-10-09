import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // During build time or before env is provided, prevent crashing import
  // In runtime queries, missing DATABASE_URL will alert clearly
}

const sql = neon(databaseUrl || "");

export const db = drizzle(sql, { schema });
