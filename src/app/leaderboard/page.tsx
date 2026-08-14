import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { BRAND, Brand } from "@/components/Brand";
import { getCurrentUser } from "@/lib/auth/session";
import {
  loadLeaderboard,
  TOP_SIZE,
  type LeaderboardPeriod,
  type LeaderboardRow,
} from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: `Рейтинг — ${BRAND}`,
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const search = await searchParams;
  const period: LeaderboardPeriod = search.period === "week" ? "week" : "all";
  const board = await loadLeaderboard(period, user.id);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <header className="mb-6 flex items-center justify-between gap-3">
        <Link href="/">
          <Brand className="text-xl" />
        </Link>
        <Link
          href="/play"
          className="rounded-lg bg-crimson px-3 py-1.5 text-sm font-semibold text-paper transition hover:bg-deep"
        >
          Играть
        </Link>
      </header>

      <h1 className="mb-1 text-2xl font-bold">Рейтинг общей комнаты</h1>
      <p className="mb-5 text-sm text-muted">
        Очки из приватных комнат сюда не идут.
        {board.since && ` Отсчёт с ${formatDate(board.since)}.`}
      </p>

      <div className="mb-5 flex gap-2">
        <Tab href="/leaderboard" active={period === "all"}>
          За всё время
        </Tab>
        <Tab href="/leaderboard?period=week" active={period === "week"}>
          За неделю
        </Tab>
      </div>

      {board.rows.length === 0 ? (
        <p className="rounded-2xl border border-line bg-paper p-8 text-center text-sm text-muted">
          {period === "week"
            ? "На этой неделе ещё никто не сыграл. Будь первым."
            : "Рейтинг пока пуст. Сыграй раунд — и займёшь первое место."}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs text-muted sm:gap-3 sm:px-4">
            <span className="w-6 shrink-0">#</span>
            <span className="min-w-0 flex-1">Игрок</span>
            <span className="w-12 shrink-0 text-right">Очки</span>
            <span className="w-14 shrink-0 text-right">Раунды</span>
          </div>

          <ul>
            {board.rows.map((row) => (
              <Row key={row.userId} row={row} you={row.userId === user.id} />
            ))}
          </ul>

          {board.you && (
            <div className="border-t-2 border-dashed border-line">
              <Row row={board.you} you />
            </div>
          )}
        </div>
      )}

      {board.total > TOP_SIZE && (
        <p className="mt-3 text-center text-xs text-muted">
          Показаны первые {TOP_SIZE} из {board.total}
        </p>
      )}
    </main>
  );
}

function Row({ row, you }: { row: LeaderboardRow; you: boolean }) {
  return (
    <li
      className={`flex items-center gap-2 border-b border-line px-3 py-2.5 last:border-b-0 sm:gap-3 sm:px-4 ${
        you ? "bg-tint" : ""
      }`}
    >
      <span
        className={`tabular w-6 shrink-0 text-sm ${
          row.rank <= 3 ? "font-bold text-gold" : "text-muted"
        }`}
      >
        {row.rank}
      </span>

      <Avatar id={row.avatarId} size={32} className="shrink-0" />

      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {row.nickname}
        {you && <span className="ml-1 text-xs text-muted">· ты</span>}
      </span>

      <span className="tabular w-12 shrink-0 text-right text-sm font-semibold text-crimson">
        {row.points}
      </span>
      <span className="tabular w-14 shrink-0 text-right text-sm text-muted">
        {row.roundsPlayed}
      </span>
    </li>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "border-crimson bg-crimson text-paper"
          : "border-line bg-paper text-muted hover:border-crimson hover:text-crimson"
      }`}
    >
      {children}
    </Link>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}
