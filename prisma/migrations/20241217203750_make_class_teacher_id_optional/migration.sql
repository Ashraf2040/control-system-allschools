-- DropForeignKey
ALTER TABLE "Mark" DROP CONSTRAINT "Mark_classTeacherId_fkey";

-- AlterTable
ALTER TABLE "Mark" ALTER COLUMN "classTeacherId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_classTeacherId_fkey" FOREIGN KEY ("classTeacherId") REFERENCES "ClassTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
