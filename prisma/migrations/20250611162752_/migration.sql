-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "order_user_id" INTEGER;

-- CreateTable
CREATE TABLE "Order_User" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,

    CONSTRAINT "Order_User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_User_orderId_key" ON "Order_User"("orderId");

-- AddForeignKey
ALTER TABLE "Order_User" ADD CONSTRAINT "Order_User_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
