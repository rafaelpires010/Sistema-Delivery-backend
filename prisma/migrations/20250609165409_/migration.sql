/*
  Warnings:

  - You are about to drop the column `userId` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantId]` on the table `TenantsFaturamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TenantsFaturamento" DROP CONSTRAINT "TenantsFaturamento_userId_fkey";

-- AlterTable
ALTER TABLE "TenantsFaturamento" DROP COLUMN "userId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TenantsFaturamento_tenantId_key" ON "TenantsFaturamento"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantsFaturamento" ADD CONSTRAINT "TenantsFaturamento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
