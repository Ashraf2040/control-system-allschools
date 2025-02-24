/*
  Warnings:

  - Added the required column `academicYear` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "academicYear" TEXT NOT NULL;
