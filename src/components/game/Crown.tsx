/**
 * Корона рядом с ником. Мелкая: она метка, а не украшение, и не должна
 * перебивать сам ник.
 */
export function Crown({
  title,
  size = 13,
  className = "",
}: {
  /** Подпись для наведения и для читалки с экрана. */
  title: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 20"
      width={size}
      height={(size * 20) / 24}
      role="img"
      aria-label={title}
      className={`inline-block shrink-0 align-baseline ${className}`}
    >
      <title>{title}</title>
      <path
        d="M1.6 5.2 6.8 9.4 12 1.8l5.2 7.6 5.2-4.2-1.9 11H3.5z"
        fill="var(--color-gold)"
        stroke="var(--color-deep)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
