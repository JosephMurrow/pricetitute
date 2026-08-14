import { z } from "zod";

export const LOGIN_MIN_LENGTH = 3;
export const LOGIN_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 20;

const loginSchema = z
  .string()
  .trim()
  .min(LOGIN_MIN_LENGTH, `Логин не короче ${LOGIN_MIN_LENGTH} символов`)
  .max(LOGIN_MAX_LENGTH, `Логин не длиннее ${LOGIN_MAX_LENGTH} символов`)
  .regex(/^[A-Za-z0-9_]+$/, "В логине только латиница, цифры и подчёркивание");

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Пароль не короче ${PASSWORD_MIN_LENGTH} символов`)
  .max(128, "Пароль не длиннее 128 символов");

const nicknameSchema = z
  .string()
  .trim()
  .min(NICKNAME_MIN_LENGTH, `Ник не короче ${NICKNAME_MIN_LENGTH} символов`)
  .max(NICKNAME_MAX_LENGTH, `Ник не длиннее ${NICKNAME_MAX_LENGTH} символов`);

export const registerSchema = z.object({
  login: loginSchema,
  password: passwordSchema,
  nickname: nicknameSchema,
});

export const loginFormSchema = z.object({
  login: loginSchema,
  password: z.string().min(1, "Введи пароль"),
});

export const profileSchema = z.object({
  nickname: nicknameSchema,
  avatarId: z.coerce.number().int().min(0),
});

/** Логин уникален без учёта регистра — в базе храним приведённым к нижнему. */
export function normalizeLogin(login: string): string {
  return login.trim().toLowerCase();
}

/** Ошибки zod в вид, удобный для отрисовки под конкретными полями формы. */
export function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !result[field]) {
      result[field] = issue.message;
    }
  }
  return result;
}
