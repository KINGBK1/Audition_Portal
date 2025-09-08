-- CreateTable
CREATE TABLE "AuditionRound" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "finalSelection" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditionRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "auditionRoundId" INTEGER NOT NULL,
    "panel" INTEGER NOT NULL,
    "remarks" TEXT,
    "evaluatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditionRound_userId_round_key" ON "AuditionRound"("userId", "round");

-- AddForeignKey
ALTER TABLE "AuditionRound" ADD CONSTRAINT "AuditionRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_auditionRoundId_fkey" FOREIGN KEY ("auditionRoundId") REFERENCES "AuditionRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
