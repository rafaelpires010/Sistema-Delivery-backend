/*
  Warnings:

  - You are about to drop the column `domingo` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `quarta` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `quinta` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `sabado` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `segunda` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `sexta` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - You are about to drop the column `terca` on the `TenantFuncionamento` table. All the data in the column will be lost.
  - Added the required column `domClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quarClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quarOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quinClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quinOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sabClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sabOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sexOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terClose` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terOpen` to the `TenantFuncionamento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TenantFuncionamento" DROP COLUMN "domingo",
DROP COLUMN "quarta",
DROP COLUMN "quinta",
DROP COLUMN "sabado",
DROP COLUMN "segunda",
DROP COLUMN "sexta",
DROP COLUMN "terca",
ADD COLUMN     "domClose" TEXT NOT NULL,
ADD COLUMN     "domOpen" TEXT NOT NULL,
ADD COLUMN     "quarClose" TEXT NOT NULL,
ADD COLUMN     "quarOpen" TEXT NOT NULL,
ADD COLUMN     "quinClose" TEXT NOT NULL,
ADD COLUMN     "quinOpen" TEXT NOT NULL,
ADD COLUMN     "sabClose" TEXT NOT NULL,
ADD COLUMN     "sabOpen" TEXT NOT NULL,
ADD COLUMN     "segClose" TEXT NOT NULL,
ADD COLUMN     "segOpen" TEXT NOT NULL,
ADD COLUMN     "sexClose" TEXT NOT NULL,
ADD COLUMN     "sexOpen" TEXT NOT NULL,
ADD COLUMN     "terClose" TEXT NOT NULL,
ADD COLUMN     "terOpen" TEXT NOT NULL;
