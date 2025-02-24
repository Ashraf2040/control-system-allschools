/*
  Warnings:

  - You are about to drop the column `finalExam` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `workingQuiz` on the `Mark` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "finalExam",
DROP COLUMN "workingQuiz",
ADD COLUMN     "exam" INTEGER,
ADD COLUMN     "quiz" INTEGER;
