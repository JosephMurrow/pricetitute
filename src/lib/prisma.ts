import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { env } from "./env";

/**
 * Один экземпляр клиента на процесс. В dev-режиме Next пересоздаёт модули при
 * горячей перезагрузке, поэтому держим клиент на globalThis, иначе пул
 * соединений разрастается на каждой правке.
 *
 * Клиент создаётся при первом обращении, а не при импорте: иначе `next build`
 * требовал бы настоящую строку подключения, хотя в базу при сборке никто не
 * ходит.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function client(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const created = new PrismaClient({
    // Prisma 7 работает через драйверный адаптер, строка подключения
    // больше не берётся из schema.prisma.
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
    log: ["warn", "error"],
  });

  globalForPrisma.prisma = created;
  return created;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = client();
    const value = Reflect.get(instance, property) as unknown;

    // Методы вроде $transaction нужно вернуть привязанными к самому клиенту.
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
