import { prisma } from "../prisma";
import { QuestionQueue } from "./queue";

/** Ключ очереди общей комнаты. У приватных ключ — идентификатор комнаты. */
export const GLOBAL_ROOM_KEY = "global";

export interface QuestionPoolOptions {
  /** Брать ли вопросы с флагом 18+. В общей комнате всегда true. */
  includeAdult: boolean;
}

export interface QuestionCard {
  id: string;
  text: string;
  adult: boolean;
}

/**
 * Очередь комнаты: поднимаем сохранённый порядок, если он есть и собран с той
 * же настройкой 18+. Иначе собираем свежую перемешанную.
 */
export async function loadQuestionQueue(
  roomKey: string,
  { includeAdult }: QuestionPoolOptions,
): Promise<QuestionQueue> {
  const questions = await prisma.question.findMany({
    where: { active: true, ...(includeAdult ? {} : { adult: false }) },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const ids = questions.map((question) => question.id);
  const saved = await prisma.roomQuestionQueue.findUnique({
    where: { roomKey },
  });

  if (saved && saved.includeAdult === includeAdult) {
    return QuestionQueue.restore(ids, {
      queue: saved.queue,
      consumed: saved.consumed,
    });
  }

  return QuestionQueue.create(ids);
}

export async function saveQuestionQueue(
  roomKey: string,
  queue: QuestionQueue,
  { includeAdult }: QuestionPoolOptions,
): Promise<void> {
  const { queue: items, consumed } = queue.snapshot();

  await prisma.roomQuestionQueue.upsert({
    where: { roomKey },
    create: { roomKey, queue: items, consumed, includeAdult },
    update: { queue: items, consumed, includeAdult },
  });
}

/** Убрать очередь вместе с приватной комнатой. */
export async function dropQuestionQueue(roomKey: string): Promise<void> {
  await prisma.roomQuestionQueue.deleteMany({ where: { roomKey } });
}

export async function getQuestionCard(
  id: string,
): Promise<QuestionCard | null> {
  return prisma.question.findUnique({
    where: { id },
    select: { id: true, text: true, adult: true },
  });
}
