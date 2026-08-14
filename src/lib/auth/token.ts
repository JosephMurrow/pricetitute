import { SignJWT, jwtVerify } from "jose";

/**
 * Подписанный сессионный токен. Читается и из серверных компонентов, и из
 * middleware, и из сокет-сервера, поэтому берёт секрет напрямую из окружения
 * и не тянет за собой остальную схему env.
 */
const ALGORITHM = "HS256";

/** Имя сессионной cookie. Живёт здесь, чтобы middleware не тянул Prisma. */
export const SESSION_COOKIE = "pt_session";

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET не задан или короче 32 символов");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  userId: string,
  maxAgeSeconds: number,
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

/** Возвращает id игрока или null, если токен протух, подделан или мусорный. */
export async function readSessionToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: [ALGORITHM],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
