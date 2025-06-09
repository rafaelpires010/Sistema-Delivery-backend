/*
  Warnings:

  - You are about to drop the column `nrNenda` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `nrVenda` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "nrNenda",
ADD COLUMN     "nrVenda" TEXT NOT NULL;
