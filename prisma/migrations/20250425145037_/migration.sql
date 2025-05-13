/*
  Warnings:

  - You are about to drop the column `descricao` on the `UserRole` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "descricao",
ADD COLUMN     "role" TEXT;
