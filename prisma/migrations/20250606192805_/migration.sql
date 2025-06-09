/*
  Warnings:

  - You are about to drop the column `tenantsFaturamentoId` on the `ValoresFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `userTenantId` on the `ValoresFaturamento` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey";

-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_userTenantId_fkey";

-- DropIndex
DROP INDEX "ValoresFaturamento_userTenantId_key";

-- AlterTable
ALTER TABLE "UserTenant" ADD COLUMN     "valoresFaturamentoId" INTEGER;

-- AlterTable
ALTER TABLE "ValoresFaturamento" DROP COLUMN "tenantsFaturamentoId",
DROP COLUMN "userTenantId";

-- AddForeignKey
ALTER TABLE "UserTenant" ADD CONSTRAINT "UserTenant_valoresFaturamentoId_fkey" FOREIGN KEY ("valoresFaturamentoId") REFERENCES "ValoresFaturamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
