/*
  Warnings:

  - You are about to drop the column `valoresFaturamentoId` on the `TenantsFaturamento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TenantsFaturamento" DROP CONSTRAINT "TenantsFaturamento_valoresFaturamentoId_fkey";

-- AlterTable
ALTER TABLE "TenantsFaturamento" DROP COLUMN "valoresFaturamentoId";
