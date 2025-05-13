import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema de validação
const cupomSchema = z.object({
  codigo: z.string(),
  desconto: z.number(),
  tipoDesconto: z.string(),
  validade: z.string().datetime().optional(),
  dataInicio: z.string().datetime().optional(),
  limiteUso: z.number().optional(),
  usosAtuais: z.number().optional(),
  valorMinimo: z.number().optional(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

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

// Criar Cupom
export const createCupom: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tenantSlug = req.params.tenantSlug;
    const data = req.body;

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Validar dados
    const validatedData = cupomSchema.safeParse(data);
    if (!validatedData.success) {
      return res.status(400).json({ error: validatedData.error });
    }

    // Criar cupom
    const newCupom = await prisma.cupons.create({
      data: {
        ...validatedData.data,
        tenantId: tenant.id,
      },
    });

    res.status(201).json(newCupom);
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    res.status(500).json({ error: "Erro ao criar cupom" });
  }
};

// Editar Cupom
export const updateCupom: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { cupomId } = req.params;
    const tenantSlug = req.params.tenantSlug;
    const data = req.body;

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verificar se cupom existe e pertence ao tenant
    const existingCupom = await prisma.cupons.findFirst({
      where: {
        id: parseInt(cupomId),
        tenantId: tenant.id,
      },
    });

    if (!existingCupom) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Validar dados
    const validatedData = cupomSchema.partial().safeParse(data);
    if (!validatedData.success) {
      return res.status(400).json({ error: validatedData.error });
    }

    // Atualizar cupom
    const updatedCupom = await prisma.cupons.update({
      where: { id: parseInt(cupomId) },
      data: validatedData.data,
    });

    res.json(updatedCupom);
  } catch (error) {
    console.error("Erro ao atualizar cupom:", error);
    res.status(500).json({ error: "Erro ao atualizar cupom" });
  }
};

// Deletar Cupom
export const deleteCupom: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { cupomId } = req.params;
    const tenantSlug = req.params.tenantSlug;

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verificar se cupom existe e pertence ao tenant
    const existingCupom = await prisma.cupons.findFirst({
      where: {
        id: parseInt(cupomId),
        tenantId: tenant.id,
      },
    });

    if (!existingCupom) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Deletar cupom
    await prisma.cupons.delete({
      where: { id: parseInt(cupomId) },
    });

    res.json({ message: "Cupom deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar cupom:", error);
    res.status(500).json({ error: "Erro ao deletar cupom" });
  }
};

// Toggle status do cupom (ativo/inativo)
export const cupomToggleStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { cupomId } = req.params;
    const tenantSlug = req.params.tenantSlug;

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verificar se cupom existe e pertence ao tenant
    const cupom = await prisma.cupons.findFirst({
      where: {
        id: parseInt(cupomId),
        tenantId: tenant.id,
      },
    });

    if (!cupom) {
      return res.status(404).json({ error: "Cupom não encontrado" });
    }

    // Inverter o status atual do cupom
    const updatedCupom = await prisma.cupons.update({
      where: { id: parseInt(cupomId) },
      data: {
        ativo: !cupom.ativo,
      },
    });

    res.json({
      message: `Cupom ${
        updatedCupom.ativo ? "ativado" : "desativado"
      } com sucesso`,
      ativo: updatedCupom.ativo,
    });
  } catch (error) {
    console.error("Erro ao alterar status do cupom:", error);
    res.status(500).json({ error: "Erro ao alterar status do cupom" });
  }
};

// Validar Cupom
export const validateCupom: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { codigo } = req.params;
    const tenantSlug = req.params.tenantSlug;

    // Buscar tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant não encontrado" });
    }

    // Buscar cupom
    const cupom = await prisma.cupons.findFirst({
      where: {
        codigo,
        tenantId: tenant.id,
      },
    });

    if (!cupom) {
      return res.status(404).json({ message: "Cupom não encontrado" });
    }

    // Verificar se está ativo
    if (!cupom.ativo) {
      return res.status(400).json({ message: "Cupom inativo" });
    }

    // Verificar data de validade
    if (cupom.validade && new Date(cupom.validade) < new Date()) {
      return res.status(400).json({ message: "Cupom expirado" });
    }

    // Verificar data de início
    if (cupom.dataInicio && new Date(cupom.dataInicio) > new Date()) {
      return res.status(400).json({ message: "Cupom ainda não está válido" });
    }

    // Verificar limite de uso
    if (cupom.limiteUso && cupom.usosAtuais >= cupom.limiteUso) {
      return res
        .status(400)
        .json({ message: "Limite de uso do cupom atingido" });
    }

    // Cupom válido
    return res.json({
      valid: true,
      cupom: {
        id: cupom.id,
        codigo: cupom.codigo,
        desconto: cupom.desconto,
        tipoDesconto: cupom.tipoDesconto,
        valorMinimo: cupom.valorMinimo,
      },
    });
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    res.status(500).json({ message: "Erro ao validar cupom" });
  }
};
