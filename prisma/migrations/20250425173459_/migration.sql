/*
  Warnings:

  - The primary key for the `TenantUserClaims` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TenantUserClaims` table. All the data in the column will be lost.
  - The primary key for the `TenantUserRoles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `TenantUserRoles` table. All the data in the column will be lost.
  - You are about to drop the column `cargo` on the `UserTenant` table. All the data in the column will be lost.
  - Added the required column `codigo` to the `TenantUserClaims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `codigo` to the `TenantUserRoles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantUserClaims" DROP CONSTRAINT "TenantUserClaims_pkey",
DROP COLUMN "id",
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD CONSTRAINT "TenantUserClaims_pkey" PRIMARY KEY ("codigo");

-- AlterTable
ALTER TABLE "TenantUserRoles" DROP CONSTRAINT "TenantUserRoles_pkey",
DROP COLUMN "id",
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD CONSTRAINT "TenantUserRoles_pkey" PRIMARY KEY ("codigo");

-- AlterTable
ALTER TABLE "UserTenant" DROP COLUMN "cargo";
