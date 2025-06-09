/*
  Warnings:

  - Added the required column `implantacao` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mensalidade` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantsFaturamento" ADD COLUMN     "implantacao" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mensalidade" DOUBLE PRECISION NOT NULL;
