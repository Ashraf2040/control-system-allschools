-- CreateTable
CREATE TABLE "MarkHeaderConfig" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "headers" TEXT[],
    "maxValues" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarkHeaderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarkHeaderConfig_subjectId_grade_key" ON "MarkHeaderConfig"("subjectId", "grade");

-- AddForeignKey
ALTER TABLE "MarkHeaderConfig" ADD CONSTRAINT "MarkHeaderConfig_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
