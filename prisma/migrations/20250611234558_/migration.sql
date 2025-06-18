/*
  Warnings:

  - A unique constraint covering the columns `[guestToken]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestToken" TEXT,
ADD COLUMN     "guestTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_guestToken_key" ON "Order"("guestToken");
