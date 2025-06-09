/*
  Warnings:

  - Added the required column `shippingPrice` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingPrice" DOUBLE PRECISION NOT NULL;
