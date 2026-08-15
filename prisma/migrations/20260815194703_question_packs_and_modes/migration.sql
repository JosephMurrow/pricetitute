-- CreateEnum
CREATE TYPE "QuestionPack" AS ENUM ('STANDARD', 'DRUNK', 'SEX', 'CRIME', 'BLACK');

-- CreateEnum
CREATE TYPE "QuestionMode" AS ENUM ('NORMAL', 'DRUNK_PARTY', 'HARDCORE');

-- DropIndex
DROP INDEX "questions_active_adult_idx";

-- AlterTable
ALTER TABLE "private_rooms" ADD COLUMN     "mode" "QuestionMode" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "category",
ADD COLUMN     "pack" "QuestionPack" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "room_question_queues" ADD COLUMN     "mode" "QuestionMode" NOT NULL DEFAULT 'NORMAL';

-- DropEnum
DROP TYPE "QuestionCategory";

-- CreateIndex
CREATE INDEX "questions_active_pack_adult_idx" ON "questions"("active", "pack", "adult");

