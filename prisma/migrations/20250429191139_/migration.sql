/*
  Warnings:

  - You are about to drop the `CaixaOperacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FrenteDeCaixa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sangria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Suprimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CaixaOperacao" DROP CONSTRAINT "CaixaOperacao_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "CaixaOperacao" DROP CONSTRAINT "CaixaOperacao_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "FrenteDeCaixa" DROP CONSTRAINT "FrenteDeCaixa_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "FrenteDeCaixa" DROP CONSTRAINT "FrenteDeCaixa_userTenantId_fkey";

-- DropForeignKey
ALTER TABLE "Sangria" DROP CONSTRAINT "Sangria_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "Sangria" DROP CONSTRAINT "Sangria_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "Suprimento" DROP CONSTRAINT "Suprimento_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "Suprimento" DROP CONSTRAINT "Suprimento_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_frenteCaixaId_fkey";

-- DropTable
DROP TABLE "CaixaOperacao";

-- DropTable
DROP TABLE "FrenteDeCaixa";

-- DropTable
DROP TABLE "Sangria";

-- DropTable
DROP TABLE "Suprimento";

-- CreateTable
CREATE TABLE "pdvCaixaOperacao" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "operadorId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "valorInicial" DOUBLE PRECISION,
    "valorFinal" DOUBLE PRECISION,
    "observacao" TEXT,
    "dataAbertura" TIMESTAMP(3),
    "dataFechamento" TIMESTAMP(3),
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdvCaixaOperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdvFrenteDeCaixa" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "pdv" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userTenantId" INTEGER,

    CONSTRAINT "pdvFrenteDeCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdvSangria" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "pdvSangria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdvSuprimento" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "pdvSuprimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pdvCaixaOperacao" ADD CONSTRAINT "pdvCaixaOperacao_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "pdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvCaixaOperacao" ADD CONSTRAINT "pdvCaixaOperacao_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvFrenteDeCaixa" ADD CONSTRAINT "pdvFrenteDeCaixa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvFrenteDeCaixa" ADD CONSTRAINT "pdvFrenteDeCaixa_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvSangria" ADD CONSTRAINT "pdvSangria_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "pdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvSangria" ADD CONSTRAINT "pdvSangria_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvSuprimento" ADD CONSTRAINT "pdvSuprimento_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "pdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdvSuprimento" ADD CONSTRAINT "pdvSuprimento_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "pdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
