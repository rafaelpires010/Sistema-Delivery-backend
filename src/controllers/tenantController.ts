import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTenantBySlug = async (req: Request, res: Response) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).send('Tenant não encontrado');
    }
  } catch (error) {
    console.error('Erro ao obter informações do tenant:', error);
    res.status(500).send('Erro ao obter informações do tenant');
  } finally {
    await prisma.$disconnect();
  }
};
