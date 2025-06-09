/*
  Warnings:

  - You are about to drop the column `latitude` on the `User_Address` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `User_Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User_Address" DROP COLUMN "latitude",
DROP COLUMN "longitude";
