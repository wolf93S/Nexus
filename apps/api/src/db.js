import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

db.on("error", (error) => {
  console.error("NEXUS PostgreSQL pool error:", error);
});

export const checkDatabase = async () => {
  const result = await db.query("SELECT 1 AS connected");
  return result.rows[0].connected === 1;
};