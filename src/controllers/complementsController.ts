import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Criar um novo grupo de complementos
export const createComplementsGroup = async (req: Request, res: Response) => {
  const { nome, min_escolha, max_escolha, ativo = true } = req.body;
  const tenantSlug = req.params.tenantSlug;

  if (!nome) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  if (!tenantSlug) {
    return res.status(400).json({ error: "Slug do tenant é obrigatório" });
  }

  try {
    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const newComplementsGroup = await prisma.complements.create({
      data: {
        nome,
        min_escolha: min_escolha ? parseInt(min_escolha) : 0,
        max_escolha: max_escolha ? parseInt(max_escolha) : 1,
        ativo,
        tenant: {
          connect: {
            id: tenant.id,
          },
        },
      },
    });

    res.status(201).json(newComplementsGroup);
  } catch (error) {
    console.error("Erro ao criar grupo de complementos:", error);
    res
      .status(500)
      .json({ error: "Erro ao criar grupo de complementos", details: error });
  }
};

// Obter todos os grupos de complementos
export const getAllComplementsGroups = async (req: Request, res: Response) => {
  const tenantSlug = req.params.tenantSlug;

  if (!tenantSlug) {
    return res.status(400).json({ error: "Slug do tenant é obrigatório." });
  }

  try {
    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const groups = await prisma.complements.findMany({
      where: {
        id_tenant: tenant.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Erro ao obter grupos de complementos:", error);
    res
      .status(500)
      .json({ error: "Erro ao obter grupos de complementos", details: error });
  }
};

// Obter um grupo de complementos específico
export const getComplementsGroupById = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const group = await prisma.complements.findUnique({
      where: { id: parseInt(groupId) },
      include: {
        items: true,
        tenant: true,
      },
    });

    if (!group) {
      return res
        .status(404)
        .json({ error: "Grupo de complementos não encontrado" });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error("Erro ao obter grupo de complementos:", error);
    res
      .status(500)
      .json({ error: "Erro ao obter grupo de complementos", details: error });
  }
};

// Atualizar um grupo de complementos
export const updateComplementsGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { nome, min_escolha, max_escolha, ativo } = req.body;

  const dataToUpdate: any = {};
  if (nome) dataToUpdate.nome = nome;
  if (min_escolha !== undefined)
    dataToUpdate.min_escolha = parseInt(min_escolha);
  if (max_escolha !== undefined)
    dataToUpdate.max_escolha = parseInt(max_escolha);
  if (ativo !== undefined) dataToUpdate.ativo = ativo;

  try {
    const updatedGroup = await prisma.complements.update({
      where: { id: parseInt(groupId) },
      data: dataToUpdate,
      include: {
        items: true,
        tenant: true,
      },
    });
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Erro ao atualizar grupo de complementos:", error);
    res.status(500).json({
      error: "Erro ao atualizar grupo de complementos",
      details: error,
    });
  }
};

// Deletar um grupo de complementos
export const deleteComplementsGroup = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    // Primeiro, deletar todos os itens associados ao grupo
    await prisma.complement.deleteMany({
      where: { complementsId: parseInt(groupId) },
    });

    // Depois, deletar o grupo
    await prisma.complements.delete({
      where: { id: parseInt(groupId) },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar grupo de complementos:", error);
    res
      .status(500)
      .json({ error: "Erro ao deletar grupo de complementos", details: error });
  }
};
