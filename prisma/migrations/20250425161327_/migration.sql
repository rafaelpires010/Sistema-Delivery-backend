/*
  Warnings:

  - The primary key for the `UserClaims` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserClaims` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `A` on the `_UserClaimsToUserTenant` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_UserClaimsToUserTenant" DROP CONSTRAINT "_UserClaimsToUserTenant_A_fkey";

-- AlterTable
ALTER TABLE "UserClaims" DROP CONSTRAINT "UserClaims_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserClaims_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "_UserClaimsToUserTenant" DROP COLUMN "A",
ADD COLUMN     "A" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "_UserClaimsToUserTenant_AB_unique" ON "_UserClaimsToUserTenant"("A", "B");

-- AddForeignKey
ALTER TABLE "_UserClaimsToUserTenant" ADD CONSTRAINT "_UserClaimsToUserTenant_A_fkey" FOREIGN KEY ("A") REFERENCES "UserClaims"("id") ON DELETE CASCADE ON UPDATE CASCADE;
