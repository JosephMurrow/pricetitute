"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Общая комната, а в ней никого. Показываем, что делать дальше: позвать людей
 * или уйти играть с ботами в свою комнату.
 */
export function LonelyNotice() {
  const [copied, setCopied] = useState(false);

  // Ссылка берётся из адресной строки: снаружи и изнутри сети адрес разный,
  // и правильный тот, по которому человек сюда пришёл.
  const link =
    typeof window === "undefined" ? "" : `${window.location.origin}/play`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-paper p-6 text-center">
      <div>
        <h2 className="text-lg font-semibold">Ты тут один</h2>
        <p className="mx-auto mt-2 max-w-md text-balance text-sm leading-relaxed text-muted">
          Позови друзей — отправь им эту ссылку, и играйте вместе. Или уходи в
          свою комнату: там можно сыграть с ботами.
        </p>
      </div>

      <p className="tabular truncate rounded-lg border border-line bg-blush px-3 py-2 text-xs text-muted">
        {link}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => void copy()}
          className="flex-1 rounded-xl bg-crimson px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-deep"
        >
          {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
        </button>

        <Link
          href="/rooms/new"
          className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-sm font-semibold transition hover:border-crimson hover:text-crimson"
        >
          Своя комната с ботами
        </Link>
      </div>
    </div>
  );
}
