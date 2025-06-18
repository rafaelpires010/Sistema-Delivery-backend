/*
  Warnings:

  - You are about to drop the column `dataHora_pedido` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `data_order` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "dataHora_pedido",
DROP COLUMN "data_order",
ADD COLUMN     "dataHora_order" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
