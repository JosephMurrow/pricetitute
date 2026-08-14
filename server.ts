import { createServer } from "node:http";
import next from "next";
import { env } from "./src/lib/env";
import { createSocketServer, SOCKET_PATH } from "./src/server/socket";

const dev = env.NODE_ENV !== "production";

const app = next({
  dev,
  hostname: env.HOST,
  port: env.PORT,
  turbopack: dev,
});

async function main() {
  await app.prepare();

  const handleRequest = app.getRequestHandler();
  const handleUpgrade = app.getUpgradeHandler();

  const httpServer = createServer((req, res) => {
    void handleRequest(req, res);
  });

  // Socket.IO вешает собственный обработчик upgrade и разбирает только свой
  // путь. Всё остальное (в dev это HMR) отдаём Next.
  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url?.startsWith(SOCKET_PATH)) return;
    void handleUpgrade(req, socket, head);
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
