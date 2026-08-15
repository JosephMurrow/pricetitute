import { prisma } from "../prisma";
import {
  adultChoiceApplies,
  dbValue,
  PACKS_BY_MODE,
  type QuestionMode,
} from "./modes";
import { QuestionQueue } from "./queue";

/** Ключ очереди общей комнаты. У приватных ключ — идентификатор комнаты. */
export const GLOBAL_ROOM_KEY = "global";

export interface QuestionPoolOptions {
  /** Брать ли вопросы с флагом 18+. Имеет смысл только в обычном режиме. */
  includeAdult: boolean;
  /** Какими паками играет комната. Общая комната — всегда обычным. */
  mode: QuestionMode;
}

export interface QuestionCard {
  id: string;
  text: string;
  adult: boolean;
}

/**
 * Очередь комнаты: поднимаем сохранённый порядок, если он есть и собран с теми
 * же режимом и настройкой 18+. Иначе собираем свежую перемешанную — состав
 * пула изменился, и старый порядок больше ничего не значит.
 */
export async function loadQuestionQueue(
  roomKey: string,
  { includeAdult, mode }: QuestionPoolOptions,
): Promise<QuestionQueue> {
  const questions = await prisma.question.findMany({
    where: {
      active: true,
      pack: { in: [...PACKS_BY_MODE[mode]] },
      // Вне обычного режима паки взрослые целиком: отсечь по adult значит
      // остаться вообще без вопросов.
      ...(adultChoiceApplies(mode) && !includeAdult ? { adult: false } : {}),
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const ids = questions.map((question) => question.id);
  const saved = await prisma.roomQuestionQueue.findUnique({
    where: { roomKey },
  });

  if (
    saved &&
    saved.includeAdult === includeAdult &&
    saved.mode === dbValue(mode)
  ) {
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
  { includeAdult, mode }: QuestionPoolOptions,
): Promise<void> {
  const { queue: items, consumed } = queue.snapshot();
  const stored = { queue: items, consumed, includeAdult, mode: dbValue(mode) };

  await prisma.roomQuestionQueue.upsert({
    where: { roomKey },
    create: { roomKey, ...stored },
    update: stored,
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
