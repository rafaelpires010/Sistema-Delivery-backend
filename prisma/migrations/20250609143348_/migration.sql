/*
  Warnings:

  - You are about to drop the column `created_at` on the `Claims` table. All the data in the column will be lost.
  - You are about to drop the column `implantacao` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `mensalidade` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `claimsId` on the `ValoresFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `ValoresFaturamento` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenantsFaturamentoId]` on the table `ValoresFaturamento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_claimsId_fkey";

-- DropForeignKey
ALTER TABLE "ValoresFaturamento" DROP CONSTRAINT "ValoresFaturamento_userId_fkey";

-- DropIndex
DROP INDEX "ValoresFaturamento_userId_key";

-- AlterTable
ALTER TABLE "Claims" DROP COLUMN "created_at";

-- AlterTable
ALTER TABLE "TenantsFaturamento" DROP COLUMN "implantacao",
DROP COLUMN "mensalidade",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ValoresFaturamento" DROP COLUMN "claimsId",
DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "ValoresFaturamento_tenantsFaturamentoId_key" ON "ValoresFaturamento"("tenantsFaturamentoId");

-- AddForeignKey
ALTER TABLE "TenantsFaturamento" ADD CONSTRAINT "TenantsFaturamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
