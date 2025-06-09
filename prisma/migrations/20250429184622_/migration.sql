/*
  Warnings:

  - You are about to drop the column `dataAbertura` on the `FrenteDeCaixa` table. All the data in the column will be lost.
  - You are about to drop the column `dataFechamento` on the `FrenteDeCaixa` table. All the data in the column will be lost.
  - You are about to drop the column `observacao` on the `FrenteDeCaixa` table. All the data in the column will be lost.
  - You are about to drop the column `operadorId` on the `FrenteDeCaixa` table. All the data in the column will be lost.
  - You are about to drop the column `valorFinal` on the `FrenteDeCaixa` table. All the data in the column will be lost.
  - You are about to drop the column `valorInicial` on the `FrenteDeCaixa` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "FrenteDeCaixa" DROP CONSTRAINT "FrenteDeCaixa_operadorId_fkey";

-- AlterTable
ALTER TABLE "FrenteDeCaixa" DROP COLUMN "dataAbertura",
DROP COLUMN "dataFechamento",
DROP COLUMN "observacao",
DROP COLUMN "operadorId",
DROP COLUMN "valorFinal",
DROP COLUMN "valorInicial",
ADD COLUMN     "userTenantId" INTEGER;

-- CreateTable
CREATE TABLE "CaixaOperacao" (
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

    CONSTRAINT "CaixaOperacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CaixaOperacao" ADD CONSTRAINT "CaixaOperacao_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "FrenteDeCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaixaOperacao" ADD CONSTRAINT "CaixaOperacao_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FrenteDeCaixa" ADD CONSTRAINT "FrenteDeCaixa_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
