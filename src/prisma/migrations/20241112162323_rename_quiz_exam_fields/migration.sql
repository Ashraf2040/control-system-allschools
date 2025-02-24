/*
  Warnings:

  - You are about to drop the column `exam` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `quiz` on the `Mark` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "exam",
DROP COLUMN "quiz",
ADD COLUMN     "finalExam" INTEGER,
ADD COLUMN     "workingQuiz" INTEGER;
