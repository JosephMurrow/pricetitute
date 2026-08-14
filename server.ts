import { createServer } from "node:http";
import next from "next";
import type { RequestHandler, UpgradeHandler } from "next/dist/server/next";
import { env } from "./src/lib/env";
import { createSocketServer, SOCKET_PATH } from "./src/server/socket";

const dev = env.NODE_ENV !== "production";

// Обработчики появятся после app.prepare(); до первого запроса сервер всё
// равно не слушает порт, поэтому ссылки заполняются вовремя.
let handleRequest: RequestHandler | undefined;
let handleUpgrade: UpgradeHandler | undefined;

const httpServer = createServer((req, res) => {
  void handleRequest?.(req, res);
});

// Next нужен сам http-сервер: в dev-режиме он вешает на него свой HMR-сокет.
const app = next({
  dev,
  hostname: env.HOST,
  port: env.PORT,
  turbopack: dev,
  httpServer,
});

async function main() {
  await app.prepare();

  handleRequest = app.getRequestHandler();
  handleUpgrade = app.getUpgradeHandler();

  // Socket.IO разбирает только свой путь, всё остальное (в dev это HMR)
  // отдаём Next.
  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith(SOCKET_PATH)) return;
    void handleUpgrade?.(req, socket, head);
  });

  createSocketServer(httpServer);

  httpServer.listen(env.PORT, env.HOST, () => {
    console.log(`▲ Pricetitute: http://${env.HOST}:${env.PORT}`);
    console.log(`  сокеты: ${SOCKET_PATH}, режим: ${dev ? "dev" : "prod"}`);
  });
}

main().catch((error) => {
  console.error("Сервер не поднялся:", error);
  process.exit(1);
});
