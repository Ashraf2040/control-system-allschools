/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId,academicYear,trimester]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Mark_studentId_subjectId_classTeacherId_academicYear_trimes_key";

-- CreateIndex
CREATE UNIQUE INDEX "Mark_studentId_subjectId_academicYear_trimester_key" ON "Mark"("studentId", "subjectId", "academicYear", "trimester");
