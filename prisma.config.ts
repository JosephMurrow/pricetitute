// Prisma 7 больше не читает .env сам — подгружаем его здесь.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "node --env-file-if-exists=.env --import tsx prisma/seed.ts",
  },
});
