/*
  Warnings:

  - Added the required column `origem` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_id_address_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "origem" TEXT NOT NULL,
ALTER COLUMN "id_address" DROP NOT NULL;

-- CreateTable
CREATE TABLE "FrenteDeCaixa" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "operadorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFechamento" TIMESTAMP(3),
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "valorFinal" DOUBLE PRECISION,
    "observacao" TEXT,

    CONSTRAINT "FrenteDeCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sangria" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "Sangria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Suprimento" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,

    CONSTRAINT "Suprimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venda" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "formaPagamento" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operadorId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Venda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venda_orderId_key" ON "Venda"("orderId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_id_address_fkey" FOREIGN KEY ("id_address") REFERENCES "User_Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteDeCaixa" ADD CONSTRAINT "FrenteDeCaixa_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteDeCaixa" ADD CONSTRAINT "FrenteDeCaixa_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sangria" ADD CONSTRAINT "Sangria_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "FrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sangria" ADD CONSTRAINT "Sangria_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suprimento" ADD CONSTRAINT "Suprimento_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "FrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suprimento" ADD CONSTRAINT "Suprimento_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "FrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
