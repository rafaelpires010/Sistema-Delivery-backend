/*
  Warnings:

  - The primary key for the `UserRole` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `roleId` on the `UserRole` table. All the data in the column will be lost.
  - Added the required column `codigo` to the `UserRole` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_roleId_fkey";

-- AlterTable
ALTER TABLE "UserRole" DROP CONSTRAINT "UserRole_pkey",
DROP COLUMN "roleId",
ADD COLUMN     "codigo" TEXT NOT NULL,
ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "codigo");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_codigo_fkey" FOREIGN KEY ("codigo") REFERENCES "Roles"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;
