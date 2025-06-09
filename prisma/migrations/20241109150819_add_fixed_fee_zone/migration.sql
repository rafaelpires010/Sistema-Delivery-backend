/*
  Warnings:

  - Added the required column `latitude` to the `User_Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `User_Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User_Address" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Zone" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "maxDistanceKm" DOUBLE PRECISION NOT NULL,
    "fixedFee" DOUBLE PRECISION NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
