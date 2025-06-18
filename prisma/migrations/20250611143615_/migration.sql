/*
  Warnings:

  - You are about to drop the column `user_AddressId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `TenantTipoRece` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_user_AddressId_fkey";

-- DropForeignKey
ALTER TABLE "TenantTipoRece" DROP CONSTRAINT "TenantTipoRece_tenantId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "user_AddressId",
ADD COLUMN     "dataHora_entrega" TIMESTAMP(3),
ADD COLUMN     "data_pedido" TIMESTAMP(3),
ADD COLUMN     "tempo_estimado" INTEGER;

-- DropTable
DROP TABLE "TenantTipoRece";
