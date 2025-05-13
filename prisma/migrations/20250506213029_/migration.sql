/*
  Warnings:

  - You are about to drop the column `userTenantId` on the `PdvFrenteDeCaixa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PdvFrenteDeCaixa" DROP CONSTRAINT "PdvFrenteDeCaixa_userTenantId_fkey";

-- AlterTable
ALTER TABLE "PdvFrenteDeCaixa" DROP COLUMN "userTenantId",
ADD COLUMN     "operadorId" INTEGER;

-- AddForeignKey
ALTER TABLE "PdvFrenteDeCaixa" ADD CONSTRAINT "PdvFrenteDeCaixa_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
