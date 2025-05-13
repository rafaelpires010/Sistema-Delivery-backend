/*
  Warnings:

  - You are about to drop the column `roleId` on the `UserTenant` table. All the data in the column will be lost.
  - You are about to drop the `UserClaims` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserClaimsToUserTenant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cargo` to the `UserTenant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserTenant" DROP CONSTRAINT "UserTenant_roleId_fkey";

-- DropForeignKey
ALTER TABLE "_UserClaimsToUserTenant" DROP CONSTRAINT "_UserClaimsToUserTenant_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserClaimsToUserTenant" DROP CONSTRAINT "_UserClaimsToUserTenant_B_fkey";

-- AlterTable
ALTER TABLE "UserTenant" DROP COLUMN "roleId",
ADD COLUMN     "cargo" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserClaims";

-- DropTable
DROP TABLE "UserRole";

-- DropTable
DROP TABLE "_UserClaimsToUserTenant";

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Claims" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "claim" TEXT NOT NULL,

    CONSTRAINT "Claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUserRoles" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "userTenantId" INTEGER NOT NULL,

    CONSTRAINT "TenantUserRoles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUserClaims" (
    "id" SERIAL NOT NULL,
    "claimId" INTEGER NOT NULL,
    "userTenantId" INTEGER NOT NULL,

    CONSTRAINT "TenantUserClaims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_codigo_key" ON "Roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Claims_codigo_key" ON "Claims"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserRoles_userTenantId_roleId_key" ON "TenantUserRoles"("userTenantId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserClaims_userTenantId_claimId_key" ON "TenantUserClaims"("userTenantId", "claimId");

-- AddForeignKey
ALTER TABLE "TenantUserRoles" ADD CONSTRAINT "TenantUserRoles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserRoles" ADD CONSTRAINT "TenantUserRoles_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserClaims" ADD CONSTRAINT "TenantUserClaims_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserClaims" ADD CONSTRAINT "TenantUserClaims_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
