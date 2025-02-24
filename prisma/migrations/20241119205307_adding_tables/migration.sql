/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,classTeacherId,academicYear,trimester]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `academicYear` to the `Mark` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trimester` to the `Mark` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Mark_studentId_subjectId_classTeacherId_key";

-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "academicYear" TEXT NOT NULL,
ADD COLUMN     "trimester" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mark_studentId_subjectId_classTeacherId_academicYear_trimes_key" ON "Mark"("studentId", "subjectId", "classTeacherId", "academicYear", "trimester");
