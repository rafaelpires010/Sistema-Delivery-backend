/*
  Warnings:

  - You are about to drop the column `name` on the `Zone` table. All the data in the column will be lost.
  - Added the required column `additionalKmFee` to the `Zone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixedDistanceKm` to the `Zone` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Zone" DROP COLUMN "name",
ADD COLUMN     "additionalKmFee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fixedDistanceKm" DOUBLE PRECISION NOT NULL;
