/*
  Warnings:

  - Added the required column `api_key` to the `formasPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `integracao` to the `formasPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchant_id` to the `formasPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terminal_id` to the `formasPagamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `formasPagamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "formasPagamento" ADD COLUMN     "api_key" TEXT NOT NULL,
ADD COLUMN     "integracao" TEXT NOT NULL,
ADD COLUMN     "merchant_id" TEXT NOT NULL,
ADD COLUMN     "terminal_id" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "PdvFormasPagamento" (
    "id" SERIAL NOT NULL,
    "frenteCaixaId" INTEGER NOT NULL,
    "formaPagamentoId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PdvFormasPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PdvFormasPagamento_frenteCaixaId_formaPagamentoId_key" ON "PdvFormasPagamento"("frenteCaixaId", "formaPagamentoId");

-- AddForeignKey
ALTER TABLE "PdvFormasPagamento" ADD CONSTRAINT "PdvFormasPagamento_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PdvFormasPagamento" ADD CONSTRAINT "PdvFormasPagamento_formaPagamentoId_fkey" FOREIGN KEY ("formaPagamentoId") REFERENCES "formasPagamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
