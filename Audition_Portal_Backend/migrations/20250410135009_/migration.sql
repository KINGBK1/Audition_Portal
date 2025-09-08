/*
  Warnings:

  - The `option` column on the `Answer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Options" AS ENUM ('A', 'B', 'C', 'D');

-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "option",
ADD COLUMN     "option" "Options";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
ADD COLUMN     "options" "Options"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "round" INTEGER DEFAULT 0,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" DEFAULT 'USER';
