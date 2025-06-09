/*
  Warnings:

  - You are about to drop the column `tenantsFaturamentoId` on the `ValoresFaturamento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `ValoresFaturamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `ValoresFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey";

-- DropIndex
DROP INDEX "ValoresFaturamento_tenantsFaturamentoId_key";

-- AlterTable
ALTER TABLE "TenantsFaturamento" ADD COLUMN     "valoresFaturamentoId" INTEGER;

-- AlterTable
ALTER TABLE "ValoresFaturamento" DROP COLUMN "tenantsFaturamentoId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ValoresFaturamento_userId_key" ON "ValoresFaturamento"("userId");

-- AddForeignKey
ALTER TABLE "TenantsFaturamento" ADD CONSTRAINT "TenantsFaturamento_valoresFaturamentoId_fkey" FOREIGN KEY ("valoresFaturamentoId") REFERENCES "ValoresFaturamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
