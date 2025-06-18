/*
  Warnings:

  - Added the required column `preco` to the `Complements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complements" ADD COLUMN     "preco" DOUBLE PRECISION NOT NULL;
