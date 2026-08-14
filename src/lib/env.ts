import { z } from "zod";

/**
 * Переменные окружения игрового сервера. Модуль серверный — не импортировать
 * из клиентских компонентов.
 *
 * .env подгружается флагом `node --env-file-if-exists=.env` в npm-скриптах,
 * а для Prisma CLI — через dotenv в prisma.config.ts.
 *
 * Проверка ленивая и срабатывает при первом обращении к значению. Так сборка
 * не требует боевых секретов: `next build` обходит модули страниц и уронил бы
 * себя на пустом DATABASE_URL, хотя базу при сборке никто не трогает. Сервер
 * же читает окружение сразу на старте, так что падать не вовремя он не начнёт.
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

type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

function load(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Некорректное окружение. Проверь .env (образец — .env.example):\n${details}`,
    );
  }

  return parsed.data;
}

export const env = new Proxy({} as Env, {
  get(_target, property) {
    cached ??= load();
    return cached[property as keyof Env];
  },
});
