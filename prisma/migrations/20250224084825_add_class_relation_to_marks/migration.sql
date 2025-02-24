/*
  Warnings:

  - You are about to drop the column `behavior` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `finalExam` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `oralTest` on the `Mark` table. All the data in the column will be lost.
  - You are about to drop the column `workingQuiz` on the `Mark` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,subjectId,classId,academicYear,trimester]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Mark_studentId_subjectId_academicYear_trimester_key";

-- AlterTable
ALTER TABLE "Mark" DROP COLUMN "behavior",
DROP COLUMN "finalExam",
DROP COLUMN "oralTest",
DROP COLUMN "workingQuiz",
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "exam" INTEGER,
ADD COLUMN     "oral" INTEGER,
ADD COLUMN     "quiz" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Mark_studentId_subjectId_classId_academicYear_trimester_key" ON "Mark"("studentId", "subjectId", "classId", "academicYear", "trimester");

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
