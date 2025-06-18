/*
  Warnings:

  - You are about to drop the column `img` on the `Complements` table. All the data in the column will be lost.
  - You are about to drop the column `obrigatorio` on the `Complements` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `Complements` table. All the data in the column will be lost.
  - You are about to drop the column `quantidade` on the `Complements` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Complements` table. All the data in the column will be lost.
  - You are about to drop the column `qt_adicional_obrigatorio` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `_ComplementsToOrder_Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ComplementsToOrder_Product" DROP CONSTRAINT "_ComplementsToOrder_Product_A_fkey";

-- DropForeignKey
ALTER TABLE "_ComplementsToOrder_Product" DROP CONSTRAINT "_ComplementsToOrder_Product_B_fkey";

-- AlterTable
ALTER TABLE "Complements" DROP COLUMN "img",
DROP COLUMN "obrigatorio",
DROP COLUMN "preco",
DROP COLUMN "quantidade",
DROP COLUMN "tipo",
ADD COLUMN     "max_escolha" INTEGER,
ADD COLUMN     "min_escolha" INTEGER;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "qt_adicional_obrigatorio";

-- DropTable
DROP TABLE "_ComplementsToOrder_Product";

-- CreateTable
CREATE TABLE "Complement" (
    "id" SERIAL NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "nome" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "img" TEXT,
    "complementsId" INTEGER NOT NULL,

    CONSTRAINT "Complement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComplementToOrder_Product" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ComplementToOrder_Product_AB_unique" ON "_ComplementToOrder_Product"("A", "B");

-- CreateIndex
CREATE INDEX "_ComplementToOrder_Product_B_index" ON "_ComplementToOrder_Product"("B");

-- AddForeignKey
ALTER TABLE "Complement" ADD CONSTRAINT "Complement_complementsId_fkey" FOREIGN KEY ("complementsId") REFERENCES "Complements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementToOrder_Product" ADD CONSTRAINT "_ComplementToOrder_Product_A_fkey" FOREIGN KEY ("A") REFERENCES "Complement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplementToOrder_Product" ADD CONSTRAINT "_ComplementToOrder_Product_B_fkey" FOREIGN KEY ("B") REFERENCES "Order_Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
