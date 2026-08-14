-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "hostSum" INTEGER,
    "hostNever" BOOLEAN NOT NULL DEFAULT false,
    "finishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_bets" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "sum" INTEGER,
    "never" BOOLEAN NOT NULL DEFAULT false,
    "won" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "round_bets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roomKey" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "roundsPlayed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rounds_roomKey_finishedAt_idx" ON "rounds"("roomKey", "finishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "round_bets_roundId_playerId_key" ON "round_bets"("roundId", "playerId");

-- CreateIndex
CREATE INDEX "scores_roomKey_points_idx" ON "scores"("roomKey", "points");

-- CreateIndex
CREATE UNIQUE INDEX "scores_userId_roomKey_key" ON "scores"("userId", "roomKey");

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_bets" ADD CONSTRAINT "round_bets_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_bets" ADD CONSTRAINT "round_bets_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scores" ADD CONSTRAINT "scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
