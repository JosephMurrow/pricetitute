import type { IncomingHttpHeaders } from "node:http";
import { readSessionToken, SESSION_COOKIE } from "../lib/auth/token";
import { prisma } from "../lib/prisma";

export interface SocketUser {
  id: string;
  nickname: string;
  avatarId: number;
}

/** Разбор заголовка Cookie без внешних зависимостей. */
function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;

    if (part.slice(0, index).trim() === name) {
      return decodeURIComponent(part.slice(index + 1).trim());
    }
  }

  return null;
}

/**
 * Игрок за сокетом. Сессия та же, что и у страниц: подписанная cookie,
 * отдельного токена для сокетов не заводим.
 */
export async function authenticateSocket(
  headers: IncomingHttpHeaders,
): Promise<SocketUser | null> {
  const token = readCookie(headers.cookie, SESSION_COOKIE);
  const userId = await readSessionToken(token ?? undefined);
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nickname: true, avatarId: true },
  });
}
