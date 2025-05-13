/*
  Warnings:

  - You are about to drop the column `operadorId` on the `PdvFrenteDeCaixa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PdvFrenteDeCaixa" DROP CONSTRAINT "PdvFrenteDeCaixa_operadorId_fkey";

-- AlterTable
ALTER TABLE "PdvFrenteDeCaixa" DROP COLUMN "operadorId",
ADD COLUMN     "userTenantId" INTEGER;

-- AddForeignKey
ALTER TABLE "PdvFrenteDeCaixa" ADD CONSTRAINT "PdvFrenteDeCaixa_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
