/*
  Warnings:

  - You are about to drop the column `data_pedido` on the `Order` table. All the data in the column will be lost.
  - Added the required column `dataHora_pedido` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `tempo_estimado` on table `Order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "data_pedido",
ADD COLUMN     "dataHora_pedido" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "tempo_estimado" SET NOT NULL;
