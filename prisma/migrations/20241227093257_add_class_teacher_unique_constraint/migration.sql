/*
  Warnings:

  - A unique constraint covering the columns `[classId,subjectId]` on the table `ClassTeacher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacher_classId_subjectId_key" ON "ClassTeacher"("classId", "subjectId");
