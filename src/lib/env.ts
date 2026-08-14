import { z } from "zod";

/**
 * Переменные окружения игрового сервера. Модуль серверный — не импортировать
 * из клиентских компонентов.
 *
 * .env подгружается флагом `node --env-file-if-exists=.env` в npm-скриптах,
 * а для Prisma CLI — через dotenv в prisma.config.ts.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL не задан"),
  HOST: z.string().min(1).default("localhost"),
  PORT: z.coerce.number().int().positive().default(3000),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET должен быть не короче 32 символов"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Некорректное окружение. Проверь .env (образец — .env.example):\n${details}`,
  );
}

export const env = parsed.data;
