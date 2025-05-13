/*
  Warnings:

  - The primary key for the `TenantUserClaims` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `claimId` on the `TenantUserClaims` table. All the data in the column will be lost.
  - The primary key for the `TenantUserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `TenantUserRoles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `TenantUserClaims` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[codigo]` on the table `TenantUserRoles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TenantUserClaims" DROP CONSTRAINT "TenantUserClaims_claimId_fkey";

-- DropForeignKey
ALTER TABLE "TenantUserRoles" DROP CONSTRAINT "TenantUserRoles_roleId_fkey";

-- DropIndex
DROP INDEX "TenantUserClaims_userTenantId_claimId_key";

-- DropIndex
DROP INDEX "TenantUserRoles_userTenantId_roleId_key";

-- AlterTable
ALTER TABLE "TenantUserClaims" DROP CONSTRAINT "TenantUserClaims_pkey",
DROP COLUMN "claimId",
ADD CONSTRAINT "TenantUserClaims_pkey" PRIMARY KEY ("userTenantId", "codigo");

-- AlterTable
ALTER TABLE "TenantUserRoles" DROP CONSTRAINT "TenantUserRoles_pkey",
DROP COLUMN "roleId",
ADD CONSTRAINT "TenantUserRoles_pkey" PRIMARY KEY ("userTenantId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserClaims_codigo_key" ON "TenantUserClaims"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserRoles_codigo_key" ON "TenantUserRoles"("codigo");
