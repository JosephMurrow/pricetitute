# Pricetitute

Онлайн-игра: участники угадывают, за какую сумму ведущий согласился бы
совершить провокационное действие. Кто ближе всех — забирает очко.

- Правила и функционал — [docs/SPEC.md](docs/SPEC.md)
- План работ — [docs/ROADMAP.md](docs/ROADMAP.md)

## Стек

Next.js 16 (App Router) + TypeScript + Tailwind 4, Socket.IO в том же процессе,
PostgreSQL через Prisma 7.

## Запуск локально

```bash
npm install
cp .env.example .env      # и подставь свой SESSION_SECRET
npm run db:up             # postgres в docker
npx prisma migrate dev
npm run dev
```

Приложение — http://localhost:3000, сокеты — на том же порту по `/socket.io`.

Секрет генерируется так:

```bash
openssl rand -base64 48
```

## Скрипты

| Команда                     | Что делает                                   |
| --------------------------- | -------------------------------------------- |
| `npm run dev`               | Next + Socket.IO в одном процессе, dev-режим |
| `npm run build`             | Продакшен-сборка Next                        |
| `npm start`                 | Продакшен-запуск того же кастомного сервера  |
| `npm run lint`              | ESLint                                       |
| `npm run format`            | Prettier                                     |
| `npm run typecheck`         | `tsc --noEmit`                               |
| `npm run db:up` / `db:down` | Postgres в docker-compose                    |
| `npm run db:migrate`        | `prisma migrate dev`                         |
| `npm run db:studio`         | Prisma Studio                                |

## Что важно знать про окружение

- **Prisma 7** не читает `.env` сама: строка подключения задаётся в
  `prisma.config.ts`, который подгружает dotenv. Клиент работает через
  драйверный адаптер `@prisma/adapter-pg`, а не через `url` в схеме.
- **Сгенерированный клиент** лежит в `src/generated/prisma` и не коммитится —
  создаётся на `postinstall` и на каждой миграции.
- **Сервер** запускается через `node --import tsx server.ts`: это кастомный
  сервер, поэтому `next dev` напрямую использовать не нужно.
- **`httpServer` обязательно передаётся в `next({ ... })`.** Иначе Next не
  вешает на сервер свой HMR-сокет, и горячая перезагрузка молча не работает —
  в консоли только ошибка подключения к `/_next/hmr`. Поэтому http-сервер
  создаётся до `next()`, а обработчики запросов подставляются после
  `prepare()`.
- **Socket.IO поднят с `destroyUpgrade: false`.** По умолчанию Engine.IO
  добивает upgrade-запросы, которые не попали в его путь, — в одном процессе
  с Next это ломает тот же HMR-сокет.
- **`proxy.ts`, а не `middleware.ts`.** В Next 16 старое соглашение объявлено
  устаревшим; файл должен экспортировать функцию с именем `proxy`. После
  переименования нужно снести `.next`, иначе Turbopack ещё какое-то время
  ругается на устаревший кеш.
