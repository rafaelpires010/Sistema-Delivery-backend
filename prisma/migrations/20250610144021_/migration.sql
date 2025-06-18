/*
  Warnings:

  - Added the required column `tipo` to the `Complements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complements" ADD COLUMN     "quantidade" INTEGER,
ADD COLUMN     "tipo" TEXT NOT NULL;
