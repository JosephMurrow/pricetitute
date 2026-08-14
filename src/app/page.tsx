import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { getCurrentUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          Price<span className="text-hot">titute</span>
        </h1>
        <p className="max-w-md text-balance text-muted">
          Угадай, за какую сумму человек согласился бы это сделать. Ближе всех к
          правде — забирает очко.
        </p>
      </div>

      {user ? (
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3 transition hover:border-hot"
        >
          <Avatar id={user.avatarId} size={40} />
          <span className="text-left">
            <span className="block font-semibold">{user.nickname}</span>
            <span className="block text-xs text-muted">Открыть профиль</span>
          </span>
        </Link>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-hot px-6 py-2.5 font-semibold text-ink transition hover:brightness-110"
          >
            Зарегистрироваться
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-line px-6 py-2.5 font-semibold transition hover:border-hot hover:text-hot"
          >
            Войти
          </Link>
        </div>
      )}

      <p className="text-sm text-muted">
        Этап 1: аккаунты. Игровые комнаты появятся дальше по роадмапу.
      </p>
    </main>
  );
}
