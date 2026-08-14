import { cookies } from "next/headers";
import { prisma } from "../prisma";
import { readSessionToken, SESSION_COOKIE, signSessionToken } from "./token";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 дней

export async function startSession(userId: string): Promise<void> {
  const token = await signSessionToken(userId, SESSION_MAX_AGE_SECONDS);
  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

export interface CurrentUser {
  id: string;
  login: string;
  nickname: string;
  avatarId: number;
}

/**
 * Текущий игрок или null. Токен может быть валидным, но пользователя уже нет
 * (удалён) — тогда тоже null.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, login: true, nickname: true, avatarId: true },
  });

  return user;
}
