import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_iYofhpC6Pu2k@ep-rapid-dawn-adzwkfzg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

export const db = drizzle(pool, { schema });
export type DbType = typeof db;
