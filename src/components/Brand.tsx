/**
 * Название игры. В интерфейсе оно всегда русское — «Платитутка»;
 * латинское Pricetitute остаётся только именем репозитория.
 */
export const BRAND = "Платитутка";

export function Brand({ className }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className ?? ""}`}>
      Плати<span className="text-crimson">тутка</span>
    </span>
  );
}
