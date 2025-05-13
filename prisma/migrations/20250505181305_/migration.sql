-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_frenteCaixaId_fkey";

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "frenteCaixaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_frenteCaixaId_fkey" FOREIGN KEY ("frenteCaixaId") REFERENCES "PdvFrenteDeCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
