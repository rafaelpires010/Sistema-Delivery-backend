/*
  Warnings:

  - You are about to drop the column `userTenantId` on the `UserClaims` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `UserClaims` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `UserClaims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserClaims" DROP CONSTRAINT "UserClaims_userTenantId_fkey";

-- DropIndex
DROP INDEX "UserClaims_userTenantId_claim_key";

-- AlterTable
ALTER TABLE "UserClaims" DROP COLUMN "userTenantId",
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "tenantId" INTEGER;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "codigo" TEXT NOT NULL,
ADD COLUMN     "tenantId" INTEGER;

-- CreateTable
CREATE TABLE "_UserClaimsToUserTenant" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserClaimsToUserTenant_AB_unique" ON "_UserClaimsToUserTenant"("A", "B");

-- CreateIndex
CREATE INDEX "_UserClaimsToUserTenant_B_index" ON "_UserClaimsToUserTenant"("B");

-- CreateIndex
CREATE UNIQUE INDEX "UserClaims_codigo_key" ON "UserClaims"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_codigo_key" ON "UserRole"("codigo");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClaims" ADD CONSTRAINT "UserClaims_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserClaimsToUserTenant" ADD CONSTRAINT "_UserClaimsToUserTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "UserClaims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserClaimsToUserTenant" ADD CONSTRAINT "_UserClaimsToUserTenant_B_fkey" FOREIGN KEY ("B") REFERENCES "UserTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
