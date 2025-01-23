import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createProductSchema, updateProductSchema } from "../schema/product";

const prisma = new PrismaClient();

// Obter Cupons por Tenant
export const getCuponsByTenant: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        cupons: true,
      },
    });

    if (tenant) {
      res.json(tenant.cupons);
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter Cupons:", error);
    res.status(500).send("Erro ao obter Cupons");
  } finally {
    await prisma.$disconnect();
  }
};
