import type { Server as HttpServer } from "node:http";
import { Server as IOServer } from "socket.io";

/** Путь, по которому Socket.IO принимает подключения и upgrade-запросы. */
export const SOCKET_PATH = "/socket.io";

/**
 * Пока это заглушка транспорта: проверяем, что сокеты живут в одном процессе
 * с Next и переживают reconnect. Игровые события появятся на этапе 4.
 */
export function createSocketServer(httpServer: HttpServer): IOServer {
  const io = new IOServer(httpServer, {
    path: SOCKET_PATH,
    serveClient: false,
    // Engine.IO по умолчанию добивает upgrade-запросы, которые не попали в его
    // путь. В одном процессе с Next это убивает HMR-сокет, поэтому чужие
    // upgrade'ы оставляем в покое — их разбирает обработчик в server.ts.
    destroyUpgrade: false,
  });

  io.on("connection", (socket) => {
    console.log(`[socket] подключился ${socket.id}`);

    socket.on("ping:check", (ack: unknown) => {
      if (typeof ack === "function") {
        (ack as (payload: { ok: true; at: number }) => void)({
          ok: true,
          at: Date.now(),
        });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] отключился ${socket.id}: ${reason}`);
    });
  });

  return io;
}
