/*
  Warnings:

  - You are about to drop the column `email` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Tenant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Tenant_email_key";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "email",
DROP COLUMN "senha";
