-- CreateTable
CREATE TABLE "TenantInfo" (
    "id" SERIAL NOT NULL,
    "cnpj" TEXT NOT NULL,
    "telefone" TEXT,
    "whatsapp" TEXT,
    "cep" TEXT NOT NULL,
    "rua" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "instagram" TEXT,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "TenantInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantFuncionamento" (
    "id" SERIAL NOT NULL,
    "segunda" TEXT NOT NULL,
    "terca" TEXT NOT NULL,
    "quarta" TEXT NOT NULL,
    "quinta" TEXT NOT NULL,
    "sexta" TEXT NOT NULL,
    "sabado" TEXT NOT NULL,
    "domingo" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "TenantFuncionamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantTipoRece" (
    "id" SERIAL NOT NULL,
    "tipoRece" TEXT NOT NULL,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "TenantTipoRece_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantInfo_tenantId_key" ON "TenantInfo"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantFuncionamento_tenantId_key" ON "TenantFuncionamento"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantInfo" ADD CONSTRAINT "TenantInfo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantFuncionamento" ADD CONSTRAINT "TenantFuncionamento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTipoRece" ADD CONSTRAINT "TenantTipoRece_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
