/*
  Warnings:

  - Added the required column `projectScore` to the `StudentReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quizScore` to the `StudentReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentReport" ADD COLUMN     "projectScore" INTEGER NOT NULL,
ADD COLUMN     "quizScore" INTEGER NOT NULL;
