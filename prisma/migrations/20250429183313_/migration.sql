/*
  Warnings:

  - Added the required column `pdv` to the `FrenteDeCaixa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FrenteDeCaixa" ADD COLUMN     "pdv" TEXT NOT NULL;
