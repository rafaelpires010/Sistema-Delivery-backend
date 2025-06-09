-- CreateTable
CREATE TABLE "Cupons" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "desconto" DOUBLE PRECISION NOT NULL,
    "tipoDesconto" TEXT NOT NULL,
    "validade" TIMESTAMP(3),
    "dataInicio" TIMESTAMP(3),
    "limiteUso" INTEGER,
    "usosAtuais" INTEGER NOT NULL DEFAULT 0,
    "valorMinimo" DOUBLE PRECISION,
    "descricao" TEXT,
    "tenantId" INTEGER NOT NULL,

    CONSTRAINT "Cupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupons_codigo_key" ON "Cupons"("codigo");

-- AddForeignKey
ALTER TABLE "Cupons" ADD CONSTRAINT "Cupons_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
