/*
  Warnings:

  - Added the required column `OnClose` to the `Tenant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "OnClose" BOOLEAN NOT NULL;
