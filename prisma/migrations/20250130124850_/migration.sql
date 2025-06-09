/*
  Warnings:

  - You are about to drop the column `nome` on the `Cupons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cupons" DROP COLUMN "nome",
ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Campanhas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "cupomId" INTEGER,

    CONSTRAINT "Campanhas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Campanhas" ADD CONSTRAINT "Campanhas_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "Cupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campanhas" ADD CONSTRAINT "Campanhas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
