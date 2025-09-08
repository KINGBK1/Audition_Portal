/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contact]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "specialization" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_contact_key" ON "User"("contact");
