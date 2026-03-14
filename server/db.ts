import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection URL must be set. Provide SUPABASE_DATABASE_URL or DATABASE_URL.",
  );
}

export const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle(pool, { schema });
