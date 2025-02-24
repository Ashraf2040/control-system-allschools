/*
  Warnings:

  - A unique constraint covering the columns `[subjectId,teacherId,classId]` on the table `SubjectTeacher` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "SubjectTeacher_subjectId_teacherId_key";

-- AlterTable
ALTER TABLE "SubjectTeacher" ADD COLUMN     "classId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTeacher_subjectId_teacherId_classId_key" ON "SubjectTeacher"("subjectId", "teacherId", "classId");

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
