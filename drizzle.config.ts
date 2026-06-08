import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local for CLI commands (Next.js handles this automatically at runtime)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
