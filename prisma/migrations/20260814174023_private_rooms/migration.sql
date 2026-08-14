-- CreateEnum
CREATE TYPE "RoomEndMode" AS ENUM ('ENDLESS', 'ROUNDS', 'POINTS');

-- CreateTable
CREATE TABLE "private_rooms" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "bettingMs" INTEGER NOT NULL DEFAULT 300000,
    "includeAdult" BOOLEAN NOT NULL DEFAULT true,
    "endMode" "RoomEndMode" NOT NULL DEFAULT 'ENDLESS',
    "endValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emptySince" TIMESTAMP(3),

    CONSTRAINT "private_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "private_rooms_code_key" ON "private_rooms"("code");

-- CreateIndex
CREATE INDEX "private_rooms_emptySince_idx" ON "private_rooms"("emptySince");

-- AddForeignKey
ALTER TABLE "private_rooms" ADD CONSTRAINT "private_rooms_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
