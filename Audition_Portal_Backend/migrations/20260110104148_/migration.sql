-- AlterTable
ALTER TABLE "RoundTwoReview" ADD COLUMN     "colour" TEXT NOT NULL DEFAULT '#898989',
ALTER COLUMN "forwarded" SET DEFAULT true;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "round" SET DEFAULT 1;
