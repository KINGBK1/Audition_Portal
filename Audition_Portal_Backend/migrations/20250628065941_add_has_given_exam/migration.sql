-- CreateTable
CREATE TABLE "RoundTwo" (
    "id" TEXT NOT NULL,
    "taskAlloted" TEXT NOT NULL,
    "taskLink" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "addOns" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RoundTwo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundTwo_userId_key" ON "RoundTwo"("userId");

-- AddForeignKey
ALTER TABLE "RoundTwo" ADD CONSTRAINT "RoundTwo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
