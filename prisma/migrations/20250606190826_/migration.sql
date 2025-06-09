-- CreateTable
CREATE TABLE "ValoresFaturamento" (
    "id" SERIAL NOT NULL,
    "valorMensalidade" DOUBLE PRECISION NOT NULL,
    "valorImplantacao" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userTenantId" INTEGER NOT NULL,
    "tenantsFaturamentoId" INTEGER NOT NULL,

    CONSTRAINT "ValoresFaturamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantsFaturamento" (
    "id" SERIAL NOT NULL,
    "mensalidade" DOUBLE PRECISION NOT NULL,
    "implantacao" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantsFaturamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ValoresFaturamento_userTenantId_key" ON "ValoresFaturamento"("userTenantId");

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_userTenantId_fkey" FOREIGN KEY ("userTenantId") REFERENCES "UserTenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValoresFaturamento" ADD CONSTRAINT "ValoresFaturamento_tenantsFaturamentoId_fkey" FOREIGN KEY ("tenantsFaturamentoId") REFERENCES "TenantsFaturamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
