/*
  Warnings:

  - You are about to drop the column `operadorId` on the `UserTenant` table. All the data in the column will be lost.
  - You are about to drop the column `operadorSenha` on the `UserTenant` table. All the data in the column will be lost.
  - You are about to drop the column `frenteCaixaId` on the `Venda` table. All the data in the column will be lost.
  - You are about to drop the `PdvCaixaOperacao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PdvFormasPagamento` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PdvFrenteDeCaixa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PdvSangria` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PdvSuprimento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PdvCaixaOperacao" DROP CONSTRAINT "PdvCaixaOperacao_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "PdvCaixaOperacao" DROP CONSTRAINT "PdvCaixaOperacao_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "PdvFormasPagamento" DROP CONSTRAINT "PdvFormasPagamento_formaPagamentoId_fkey";

-- DropForeignKey
ALTER TABLE "PdvFormasPagamento" DROP CONSTRAINT "PdvFormasPagamento_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "PdvFrenteDeCaixa" DROP CONSTRAINT "PdvFrenteDeCaixa_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PdvFrenteDeCaixa" DROP CONSTRAINT "PdvFrenteDeCaixa_userTenantId_fkey";

-- DropForeignKey
ALTER TABLE "PdvSangria" DROP CONSTRAINT "PdvSangria_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "PdvSangria" DROP CONSTRAINT "PdvSangria_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "PdvSuprimento" DROP CONSTRAINT "PdvSuprimento_frenteCaixaId_fkey";

-- DropForeignKey
ALTER TABLE "PdvSuprimento" DROP CONSTRAINT "PdvSuprimento_operadorId_fkey";

-- DropForeignKey
ALTER TABLE "Venda" DROP CONSTRAINT "Venda_frenteCaixaId_fkey";

-- AlterTable
ALTER TABLE "UserTenant" DROP COLUMN "operadorId",
DROP COLUMN "operadorSenha";

-- AlterTable
ALTER TABLE "Venda" DROP COLUMN "frenteCaixaId";

-- DropTable
DROP TABLE "PdvCaixaOperacao";

-- DropTable
DROP TABLE "PdvFormasPagamento";

-- DropTable
DROP TABLE "PdvFrenteDeCaixa";

-- DropTable
DROP TABLE "PdvSangria";

-- DropTable
DROP TABLE "PdvSuprimento";
