import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set");
}

const http = neon(process.env.DATABASE_URL ?? "postgresql://localhost/bebooked");

export const db = drizzle(http, { schema });
