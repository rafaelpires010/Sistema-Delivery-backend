/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ValoresFaturamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantsFaturamentoId` to the `ValoresFaturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ValoresFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserTenant" DROP CONSTRAINT "UserTenant_valoresFaturamentoId_fkey";

-- AlterTable
ALTER TABLE "ValoresFaturamento" ADD COLUMN     "tenantsFaturamentoId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ValoresFaturamento_userId_key" ON "ValoresFaturamento"("userId");

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey" FOREIGN KEY ("tenantsFaturamentoId") REFERENCES "TenantsFaturamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
