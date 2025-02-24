/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `behavior` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `finalExam` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `participation` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `project` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `totalMarks` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `workingQuiz` on the `students` table. All the data in the column will be lost.
  - You are about to drop the `ClassSubjectTeacher` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClassSubjectTeacher" DROP CONSTRAINT "ClassSubjectTeacher_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSubjectTeacher" DROP CONSTRAINT "ClassSubjectTeacher_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "ClassSubjectTeacher" DROP CONSTRAINT "ClassSubjectTeacher_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_subjectId_fkey";

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "subjectId";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "behavior",
DROP COLUMN "finalExam",
DROP COLUMN "participation",
DROP COLUMN "project",
DROP COLUMN "totalMarks",
DROP COLUMN "workingQuiz";

-- DropTable
DROP TABLE "ClassSubjectTeacher";

-- CreateTable
CREATE TABLE "ClassTeacher" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "ClassTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectTeacher" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "SubjectTeacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marks" (
    "id" TEXT NOT NULL,
    "participation" INTEGER,
    "behavior" INTEGER,
    "workingQuiz" INTEGER,
    "project" INTEGER,
    "finalExam" INTEGER,
    "totalMarks" INTEGER,
    "studentId" TEXT NOT NULL,
    "classTeacherId" TEXT NOT NULL,

    CONSTRAINT "marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassTeacher_classId_teacherId_key" ON "ClassTeacher"("classId", "teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_classId_subjectId_key" ON "ClassSubject"("classId", "subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectTeacher_subjectId_teacherId_key" ON "SubjectTeacher"("subjectId", "teacherId");

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTeacher" ADD CONSTRAINT "ClassTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectTeacher" ADD CONSTRAINT "SubjectTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marks" ADD CONSTRAINT "marks_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "ClassTeacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
