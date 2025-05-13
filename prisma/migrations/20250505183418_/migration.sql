/*
  Warnings:

  - You are about to drop the column `metodo_pagamento` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `formaPagamento` on the `Venda` table. All the data in the column will be lost.
  - Added the required column `formaPagamentoId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formaPagamentoId` to the `Venda` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Venda` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "metodo_pagamento",
ADD COLUMN     "formaPagamentoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "formaPagamento",
ADD COLUMN     "formaPagamentoId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "formasPagamento" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "formasPagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formasPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formasPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "formasPagamento" ADD CONSTRAINT "formasPagamento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
