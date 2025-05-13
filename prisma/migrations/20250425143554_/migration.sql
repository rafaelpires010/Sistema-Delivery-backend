/*
  Warnings:

  - You are about to drop the column `role` on the `UserTenant` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `UserTenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTenant" DROP COLUMN "role",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD COLUMN     "ultimo_login" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserClaims" (
    "id" TEXT NOT NULL,
    "claim" TEXT NOT NULL,
    "userTenantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserClaims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserClaims_userTenantId_claim_key" ON "UserClaims"("userTenantId", "claim");

-- AddForeignKey
ALTER TABLE "UserTenant" ADD CONSTRAINT "UserTenant_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClaims" ADD CONSTRAINT "UserClaims_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
