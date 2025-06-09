-- AlterTable
ALTER TABLE "formasPagamento" ALTER COLUMN "api_key" DROP NOT NULL,
ALTER COLUMN "integracao" DROP NOT NULL,
ALTER COLUMN "merchant_id" DROP NOT NULL,
ALTER COLUMN "terminal_id" DROP NOT NULL;
