/*
  Warnings:

  - You are about to drop the `pdvCaixaOperacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pdvFrenteDeCaixa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pdvSangria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pdvSuprimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "pdvCaixaOperacao" DROP CONSTRAINT "pdvCaixaOperacao_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "pdvCaixaOperacao" DROP CONSTRAINT "pdvCaixaOperacao_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "pdvFrenteDeCaixa" DROP CONSTRAINT "pdvFrenteDeCaixa_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pdvFrenteDeCaixa" DROP CONSTRAINT "pdvFrenteDeCaixa_userTenantId_fkey";

-- DropForeignKey
ALTER TABLE "pdvSangria" DROP CONSTRAINT "pdvSangria_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "pdvSangria" DROP CONSTRAINT "pdvSangria_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "pdvSuprimento" DROP CONSTRAINT "pdvSuprimento_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "pdvSuprimento" DROP CONSTRAINT "pdvSuprimento_operadorId_fkey";

-- DropTable
DROP TABLE "pdvCaixaOperacao";

-- DropTable
DROP TABLE "pdvFrenteDeCaixa";

-- DropTable
DROP TABLE "pdvSangria";

-- DropTable
DROP TABLE "pdvSuprimento";

-- CreateTable
CREATE TABLE "PdvCaixaOperacao" (
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

    CONSTRAINT "PdvCaixaOperacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdvFrenteDeCaixa" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "pdv" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userTenantId" INTEGER,

    CONSTRAINT "PdvFrenteDeCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdvSangria" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "PdvSangria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdvSuprimento" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "PdvSuprimento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PdvCaixaOperacao" ADD CONSTRAINT "PdvCaixaOperacao_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvCaixaOperacao" ADD CONSTRAINT "PdvCaixaOperacao_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvFrenteDeCaixa" ADD CONSTRAINT "PdvFrenteDeCaixa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvFrenteDeCaixa" ADD CONSTRAINT "PdvFrenteDeCaixa_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvSangria" ADD CONSTRAINT "PdvSangria_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvSangria" ADD CONSTRAINT "PdvSangria_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvSuprimento" ADD CONSTRAINT "PdvSuprimento_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvSuprimento" ADD CONSTRAINT "PdvSuprimento_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
