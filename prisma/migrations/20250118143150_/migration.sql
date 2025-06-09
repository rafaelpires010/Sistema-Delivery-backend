/*
  Warnings:

  - You are about to drop the column `tempoMaxEntre` on the `TenantInfo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TenantInfo" DROP COLUMN "tempoMaxEntre";

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "tempoMaxEntre" DOUBLE PRECISION;
