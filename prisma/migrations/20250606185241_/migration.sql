/*
  Warnings:

  - You are about to drop the `TenantsFaturamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ValoresFaturamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey";

-- DropTable
DROP TABLE "TenantsFaturamento";

-- DropTable
DROP TABLE "ValoresFaturamento";
