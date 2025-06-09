/*
  Warnings:

  - You are about to drop the column `implantacao` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `mensalidade` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - Added the required column `valorImplantacao` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorMensalidade` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantsFaturamento" DROP COLUMN "implantacao",
DROP COLUMN "mensalidade",
ADD COLUMN     "valorImplantacao" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "valorMensalidade" DOUBLE PRECISION NOT NULL;
