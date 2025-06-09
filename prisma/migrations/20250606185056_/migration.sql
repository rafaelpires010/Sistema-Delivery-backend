/*
  Warnings:

  - You are about to drop the column `valorImplantacao` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - You are about to drop the column `valorMensalidade` on the `TenantsFaturamento` table. All the data in the column will be lost.
  - Added the required column `implantacao` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mensalidade` to the `TenantsFaturamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantsFaturamento" DROP COLUMN "valorImplantacao",
DROP COLUMN "valorMensalidade",
ADD COLUMN     "implantacao" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "mensalidade" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "ValoresFaturamento" (
    "id" SERIAL NOT NULL,
    "valorMensalidade" DOUBLE PRECISION NOT NULL DEFAULT 99.99,
    "valorImplantacao" DOUBLE PRECISION NOT NULL DEFAULT 400.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantsFaturamentoId" INTEGER NOT NULL,

    CONSTRAINT "ValoresFaturamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey" FOREIGN KEY ("tenantsFaturamentoId") REFERENCES "TenantsFaturamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
