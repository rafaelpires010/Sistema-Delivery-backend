/*
  Warnings:

  - Added the required column `nrNenda` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Venda" ADD COLUMN     "nrNenda" TEXT NOT NULL;
