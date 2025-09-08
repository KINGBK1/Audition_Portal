-- AlterTable
ALTER TABLE "RoundTwo" ADD COLUMN     "panel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "RoundTwoReview" (
    "id" TEXT NOT NULL,
    "attendance" BOOLEAN NOT NULL,
    "reviewedBy" TEXT NOT NULL,
    "taskgiven" TEXT NOT NULL,
    "clubPrefer" TEXT NOT NULL,
    "subDomain" TEXT NOT NULL,
    "hs_place" TEXT NOT NULL,
    "reviews" TEXT[],
    "remarks" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "gd" BOOLEAN NOT NULL,
    "general" BOOLEAN NOT NULL,
    "forwarded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "roundTwoId" TEXT,

    CONSTRAINT "RoundTwoReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoundTwoReview_roundTwoId_key" ON "RoundTwoReview"("roundTwoId");

-- AddForeignKey
ALTER TABLE "RoundTwoReview" ADD CONSTRAINT "RoundTwoReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundTwoReview" ADD CONSTRAINT "RoundTwoReview_roundTwoId_fkey" FOREIGN KEY ("roundTwoId") REFERENCES "RoundTwo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
