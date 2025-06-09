/*
  Warnings:

  - Made the column `bairro` on table `TenantInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TenantInfo" ALTER COLUMN "bairro" SET NOT NULL;
