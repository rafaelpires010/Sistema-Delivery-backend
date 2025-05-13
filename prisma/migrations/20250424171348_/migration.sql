-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cupomId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cupomId_fkey" FOREIGN KEY ("cupomId") REFERENCES "Cupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;
