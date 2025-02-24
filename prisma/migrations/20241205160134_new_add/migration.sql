/*
  Warnings:

  - You are about to drop the column `reportContent` on the `StudentReport` table. All the data in the column will be lost.
  - Added the required column `comment` to the `StudentReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `StudentReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentReport" DROP COLUMN "reportContent",
ADD COLUMN     "comment" TEXT NOT NULL,
ADD COLUMN     "recommendations" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL;
