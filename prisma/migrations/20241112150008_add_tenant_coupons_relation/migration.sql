/*
  Warnings:

  - A unique constraint covering the columns `[tenantId]` on the table `Zone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Zone_tenantId_key" ON "Zone"("tenantId");
