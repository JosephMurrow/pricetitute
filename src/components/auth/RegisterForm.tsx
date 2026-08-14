"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/lib/auth/actions";
import { EMPTY_FORM_STATE } from "@/lib/auth/form-state";
import { Field, FormError, SubmitButton } from "@/components/ui/form";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormError>{state.error}</FormError>

      <Field
        label="Логин"
        name="login"
        autoComplete="username"
        defaultValue={state.values?.login}
        hint="3–20 символов: латиница, цифры, подчёркивание"
        error={state.fieldErrors?.login}
      />

      <Field
        label="Пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Минимум 8 символов. Восстановления пароля нет — запиши его."
        error={state.fieldErrors?.password}
      />

      <Field
        label="Ник"
        name="nickname"
        autoComplete="nickname"
        defaultValue={state.values?.nickname}
        hint="Так тебя увидят в игре. Может отличаться от логина."
        error={state.fieldErrors?.nickname}
      />

      <label className="flex items-start gap-2.5 text-sm">
        <input
          type="checkbox"
          name="adult"
          defaultChecked={state.values?.adult === "on"}
          className="mt-0.5 size-4 shrink-0 accent-hot"
        />
        <span className="text-muted">
          Мне есть 18 лет. Понимаю, что вопросы бывают откровенными.
        </span>
      </label>
      {state.fieldErrors?.adult && (
        <p className="-mt-2 text-xs text-hot">{state.fieldErrors.adult}</p>
      )}

      <SubmitButton>Зарегистрироваться</SubmitButton>

      <p className="text-center text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-money hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
