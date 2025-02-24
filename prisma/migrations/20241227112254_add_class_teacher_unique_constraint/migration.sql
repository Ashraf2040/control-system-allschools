/*
  Warnings:

  - A unique constraint covering the columns `[classId,teacherId,subjectId]` on the table `ClassTeacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ClassTeacher_classId_subjectId_key";

-- DropIndex
DROP INDEX "ClassTeacher_classId_teacherId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacher_classId_teacherId_subjectId_key" ON "ClassTeacher"("classId", "teacherId", "subjectId");
