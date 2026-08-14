import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

/**
 * Один экземпляр клиента на процесс. В dev-режиме Next пересоздаёт модули при
 * горячей перезагрузке, поэтому держим клиент на globalThis, иначе пул
 * соединений разрастается на каждой правке.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Prisma 7 работает через драйверный адаптер, строка подключения
    // больше не берётся из schema.prisma.
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: ["warn", "error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
