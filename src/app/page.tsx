import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { Brand } from "@/components/Brand";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <Brand className="text-5xl sm:text-6xl" />
        <p className="max-w-md text-balance text-muted">
          Угадай, за какую сумму человек согласился бы это сделать. Ближе всех к
          правде — забирает очко.
        </p>
      </div>

      {user ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/play"
              className="rounded-xl bg-crimson px-8 py-3 text-lg font-semibold text-paper transition hover:bg-deep"
            >
              В общую комнату
            </Link>
            <Link
              href="/rooms/new"
              className="rounded-xl border border-line bg-paper px-8 py-3 text-lg font-semibold transition hover:border-crimson hover:text-crimson"
            >
              Своя комната
            </Link>
          </div>

          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-2.5 transition hover:border-crimson"
          >
            <Avatar id={user.avatarId} size={36} />
            <span className="text-left">
              <span className="block text-sm font-semibold">
                {user.nickname}
              </span>
              <span className="block text-xs text-muted">Профиль</span>
            </span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-crimson px-6 py-2.5 font-semibold text-paper transition hover:bg-deep"
          >
            Зарегистрироваться
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-line bg-paper px-6 py-2.5 font-semibold transition hover:border-crimson hover:text-crimson"
          >
            Войти
          </Link>
        </div>
      )}
    </main>
  );
}
