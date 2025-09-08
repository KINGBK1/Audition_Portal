-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
