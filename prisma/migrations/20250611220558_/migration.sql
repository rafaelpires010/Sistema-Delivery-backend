/*
  Warnings:

  - You are about to drop the column `nome` on the `OrderAddress` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `OrderAddress` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderAddress" DROP COLUMN "nome",
DROP COLUMN "telefone";
