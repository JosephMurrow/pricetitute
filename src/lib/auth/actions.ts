"use server";

import { hash, verify } from "@node-rs/argon2";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { AVATAR_COUNT, randomAvatarId } from "../avatars";
import type { FormState } from "./form-state";
import { endSession, getSessionUserId, startSession } from "./session";
import {
  fieldErrorsFrom,
  loginFormSchema,
  normalizeLogin,
  profileSchema,
  registerSchema,
} from "./validation";

/** Prisma кидает P2002 при нарушении уникальности. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const adultConfirmed = formData.get("adult") === "on";
  const values = {
    login: String(formData.get("login") ?? ""),
    nickname: String(formData.get("nickname") ?? ""),
    adult: adultConfirmed ? "on" : "",
  };

  if (!adultConfirmed) {
    return {
      values,
      fieldErrors: {
        adult: "Без подтверждения возраста играть нельзя — вопросы взрослые",
      },
    };
  }

  const parsed = registerSchema.safeParse({
    login: values.login,
    password: String(formData.get("password") ?? ""),
    nickname: values.nickname,
  });

  if (!parsed.success) {
    return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const login = normalizeLogin(parsed.data.login);
  let userId: string;

  try {
    const user = await prisma.user.create({
      data: {
        login,
        passwordHash: await hash(parsed.data.password),
        nickname: parsed.data.nickname,
        avatarId: randomAvatarId(),
        adultConfirmedAt: new Date(),
      },
      select: { id: true },
    });
    userId = user.id;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { values, fieldErrors: { login: "Такой логин уже занят" } };
    }
    console.error("Регистрация не удалась:", error);
    return { values, error: "Что-то сломалось на сервере. Попробуй ещё раз." };
  }

  await startSession(userId);
  redirect("/profile");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { login: String(formData.get("login") ?? "") };

  const parsed = loginFormSchema.safeParse({
    login: values.login,
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { login: normalizeLogin(parsed.data.login) },
    select: { id: true, passwordHash: true },
  });

  // Одинаковый текст на неизвестный логин и на неверный пароль: не подсказываем,
  // какие логины заняты.
  const wrong: FormState = { values, error: "Неверный логин или пароль" };
  if (!user) return wrong;

  const passwordOk = await verify(user.passwordHash, parsed.data.password);
  if (!passwordOk) return wrong;

  await startSession(user.id);
  redirect("/profile");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const values = { nickname: String(formData.get("nickname") ?? "") };

  const parsed = profileSchema.safeParse({
    nickname: values.nickname,
    avatarId: String(formData.get("avatarId") ?? ""),
  });

  if (!parsed.success) {
    return { values, fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  if (parsed.data.avatarId >= AVATAR_COUNT) {
    return { values, fieldErrors: { avatarId: "Такого аватара нет" } };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      nickname: parsed.data.nickname,
      avatarId: parsed.data.avatarId,
    },
  });

  revalidatePath("/profile");
  return { ok: "Сохранено" };
}
