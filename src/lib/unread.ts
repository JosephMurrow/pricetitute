/**
 * Когда ленту чата можно считать прочитанной, и что писать в облачке.
 *
 * Вынесено из компонента, потому что вся тонкость тут — в арифметике
 * видимости, а её надо проверять тестами, а не глазами.
 */

/** Какая доля ленты должна быть на экране, чтобы считать её видимой. */
export const VISIBLE_SHARE = 0.6;

/**
 * Но не больше этого числа пикселей. В альбомной ориентации телефона лента
 * бывает выше окна, и доля не наберётся никогда — облачко зависло бы навсегда.
 */
export const VISIBLE_MIN_PX = 120;

/**
 * Достаточно ли ленты на экране. `height` — вся высота ленты, `visible` —
 * сколько её попало в окно.
 */
export function enoughVisible(height: number, visible: number): boolean {
  if (height <= 0) return false;
  return visible >= Math.min(height * VISIBLE_SHARE, VISIBLE_MIN_PX);
}

export function unreadLabel(count: number, nickname: string): string {
  return count > 1
    ? `Новых сообщений: ${count}, последнее от «${nickname}»`
    : `Новое сообщение от «${nickname}»`;
}
