/*
  Warnings:

  - You are about to drop the column `descricao` on the `Complement` table. All the data in the column will be lost.
  - You are about to drop the column `img` on the `Complement` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `Complement` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `Complement` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Complement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Complement" DROP COLUMN "descricao",
DROP COLUMN "img",
DROP COLUMN "nome",
DROP COLUMN "preco",
ADD COLUMN     "productId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Complement" ADD CONSTRAINT "Complement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
