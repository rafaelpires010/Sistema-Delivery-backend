/*
  Warnings:

  - You are about to drop the column `aceitaIntegracao` on the `formasPagamento` table. All the data in the column will be lost.
  - You are about to drop the column `api_key` on the `formasPagamento` table. All the data in the column will be lost.
  - You are about to drop the column `integracao` on the `formasPagamento` table. All the data in the column will be lost.
  - You are about to drop the column `merchant_id` on the `formasPagamento` table. All the data in the column will be lost.
  - You are about to drop the column `terminal_id` on the `formasPagamento` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "formasPagamento" DROP COLUMN "aceitaIntegracao",
DROP COLUMN "api_key",
DROP COLUMN "integracao",
DROP COLUMN "merchant_id",
DROP COLUMN "terminal_id";
