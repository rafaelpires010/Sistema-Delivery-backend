-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_operadorId_fkey";

-- AlterTable
ALTER TABLE "Venda" ALTER COLUMN "operadorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "UserTenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
