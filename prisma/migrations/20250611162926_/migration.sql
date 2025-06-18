/*
  Warnings:

  - You are about to drop the column `order_user_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `limite_pdvs` on the `Tenant` table. All the data in the column will be lost.
  - You are about to drop the column `second_color` on the `Tenant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "order_user_id";

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "limite_pdvs",
DROP COLUMN "second_color";
