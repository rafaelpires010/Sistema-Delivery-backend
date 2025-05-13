-- AlterTable
ALTER TABLE "formasPagamento" ADD COLUMN     "aceitaIntegracao" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aceitaTroco" BOOLEAN NOT NULL DEFAULT false;
