/*
  Warnings:

  - Added the required column `bairro` to the `User_Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User_Address" ADD COLUMN     "bairro" TEXT NOT NULL,
ALTER COLUMN "complemento" DROP NOT NULL;
