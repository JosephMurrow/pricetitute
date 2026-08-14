"use client";

import { useFormStatus } from "react-dom";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  autoComplete,
  hint,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border bg-surface-2 px-3 py-2.5 text-body outline-none transition placeholder:text-muted focus:border-hot ${
          error ? "border-hot" : "border-line"
        }`}
      />
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
      {error && <span className="mt-1 block text-xs text-hot">{error}</span>}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-hot px-4 py-2.5 font-semibold text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Секунду…" : children}
    </button>
  );
}

export function FormError({ children }: { children?: string }) {
  if (!children) return null;

  return (
    <p className="rounded-lg border border-hot/40 bg-hot/10 px-3 py-2 text-sm text-hot">
      {children}
    </p>
  );
}

export function FormOk({ children }: { children?: string }) {
  if (!children) return null;

  return (
    <p className="rounded-lg border border-money/40 bg-money/10 px-3 py-2 text-sm text-money">
      {children}
    </p>
  );
}
