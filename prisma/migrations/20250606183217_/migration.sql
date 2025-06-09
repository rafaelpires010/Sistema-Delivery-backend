-- CreateTable
CREATE TABLE "TenantsFaturamento" (
    "id" SERIAL NOT NULL,
    "valorMensalidade" DOUBLE PRECISION NOT NULL,
    "valorImplantacao" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantsFaturamento_pkey" PRIMARY KEY ("id")
);
