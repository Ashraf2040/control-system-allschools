/*
  Warnings:

  - Added the required column `arabicName` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arabicName` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentReport" ALTER COLUMN "projectScore" DROP NOT NULL,
ALTER COLUMN "quizScore" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "arabicName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "arabicName" TEXT NOT NULL,
ADD COLUMN     "signature" TEXT;
