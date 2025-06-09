/*
  Warnings:

  - You are about to drop the column `tenantId` on the `UserClaims` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserClaims" DROP CONSTRAINT "UserClaims_tenantId_fkey";

-- AlterTable
ALTER TABLE "UserClaims" DROP COLUMN "tenantId";
