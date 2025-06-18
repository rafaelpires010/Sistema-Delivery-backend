/*
  Warnings:

  - You are about to drop the column `id_address` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_id_address_fkey";

-- DropForeignKey
ALTER TABLE "User_Address" DROP CONSTRAINT "User_Address_id_user_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "id_address",
ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "user_AddressId" INTEGER;

-- AlterTable
ALTER TABLE "User_Address" ALTER COLUMN "id_user" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Complements" (
    "id" SERIAL NOT NULL,
    "id_tenant" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nome" TEXT NOT NULL,
    "img" TEXT,

    CONSTRAINT "Complements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderAddress" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "nome" TEXT,
    "telefone" TEXT,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "complemento" TEXT,

    CONSTRAINT "OrderAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComplementsToProduct" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ComplementsToOrder_Product" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderAddress_orderId_key" ON "OrderAddress"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "_ComplementsToProduct_AB_unique" ON "_ComplementsToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_ComplementsToProduct_B_index" ON "_ComplementsToProduct"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ComplementsToOrder_Product_AB_unique" ON "_ComplementsToOrder_Product"("A", "B");

-- CreateIndex
CREATE INDEX "_ComplementsToOrder_Product_B_index" ON "_ComplementsToOrder_Product"("B");

-- AddForeignKey
ALTER TABLE "User_Address" ADD CONSTRAINT "User_Address_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_AddressId_fkey" FOREIGN KEY ("user_AddressId") REFERENCES "User_Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complements" ADD CONSTRAINT "Complements_id_tenant_fkey" FOREIGN KEY ("id_tenant") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderAddress" ADD CONSTRAINT "OrderAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementsToProduct" ADD CONSTRAINT "_ComplementsToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Complements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementsToProduct" ADD CONSTRAINT "_ComplementsToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementsToOrder_Product" ADD CONSTRAINT "_ComplementsToOrder_Product_A_fkey" FOREIGN KEY ("A") REFERENCES "Complements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementsToOrder_Product" ADD CONSTRAINT "_ComplementsToOrder_Product_B_fkey" FOREIGN KEY ("B") REFERENCES "Order_Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
