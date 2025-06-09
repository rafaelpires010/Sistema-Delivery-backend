/*
  Warnings:

  - You are about to drop the column `tenantId` on the `UserRole` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_tenantId_fkey";

-- AlterTable
ALTER TABLE "UserRole" DROP COLUMN "tenantId";
