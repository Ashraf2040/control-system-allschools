/*
  Warnings:

  - You are about to drop the `SubjectTeacher` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subjectId` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubjectTeacher" DROP CONSTRAINT "SubjectTeacher_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "SubjectTeacher" DROP CONSTRAINT "SubjectTeacher_teacherId_fkey";

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "subjectId" TEXT NOT NULL;

-- DropTable
DROP TABLE "SubjectTeacher";

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
