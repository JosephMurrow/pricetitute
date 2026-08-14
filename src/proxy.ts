import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/auth/token";

/**
 * Быстрая развилка по сессии: без похода в базу, только проверка подписи.
 * Настоящая авторизация всё равно происходит на сервере в экшенах и страницах.
 *
 * Файл называется proxy.ts, а не middleware.ts: в Next 16 старое соглашение
 * объявлено устаревшим.
 */
const PROTECTED = ["/profile", "/play"];
const GUEST_ONLY = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const userId = await readSessionToken(token);

  if (!userId && PROTECTED.some((path) => pathname.startsWith(path))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (userId && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/profile";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/play/:path*", "/login", "/register"],
};
