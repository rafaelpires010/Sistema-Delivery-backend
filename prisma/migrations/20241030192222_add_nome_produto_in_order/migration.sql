/*
  Warnings:

  - Added the required column `nome_produto` to the `Order_Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order_Product" ADD COLUMN     "nome_produto" TEXT NOT NULL;
