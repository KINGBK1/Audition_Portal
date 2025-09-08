/*
  Warnings:

  - The `option` column on the `Answer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Options') THEN
    CREATE TYPE "Options" AS ENUM ('A', 'B', 'C' , 'D');
  END IF;
END
$$;



-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "option",
ADD COLUMN     "option" "Options";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
ADD COLUMN     "options" "Options"[];

-- Add column "round" only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'round'
  ) THEN
    EXECUTE 'ALTER TABLE "User" ADD COLUMN "round" INTEGER DEFAULT 0';
  END IF;
END
$$;

-- Drop and re-add "role" column (this will drop data if it exists)
ALTER TABLE "User"
DROP COLUMN IF EXISTS "role",
ADD COLUMN "role" "Role" DEFAULT 'USER';
