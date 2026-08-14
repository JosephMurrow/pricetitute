-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('DAILY', 'SOCIAL', 'ADULT');

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" "QuestionCategory" NOT NULL,
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_question_queues" (
    "id" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "queue" TEXT[],
    "includeAdult" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_question_queues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_text_key" ON "questions"("text");

-- CreateIndex
CREATE INDEX "questions_active_adult_idx" ON "questions"("active", "adult");

-- CreateIndex
CREATE UNIQUE INDEX "room_question_queues_roomKey_key" ON "room_question_queues"("roomKey");
