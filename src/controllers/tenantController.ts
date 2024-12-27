import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ExtendedRequest } from "../types/extended-request";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.DEFAULT_TOKEN || "default_secret";

export const getTenantBySlug = async (req: ExtendedRequest, res: Response) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        tenantInfo: true, // Inclui os dados da tabela TenantInfo
        tipoRece: true, // Inclui os dados da tabela TenantTipoRece
        tenantFuncionamento: true, // Inclui os dados da tabela TenantFuncionamento
        zone: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter informações do tenant:", error);
    res.status(500).send("Erro ao obter informações do tenant");
  } finally {
    await prisma.$disconnect();
  }
};

export const getTenantOpenClose = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;

  try {
    // Consulta no banco de dados para encontrar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { OnClose: true }, // Seleciona apenas o campo `isOpen`
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Retorna o status atual do tenant (aberto/fechado)
    return res.status(200).json({ isOpen: tenant.OnClose });
  } catch (error) {
    console.error("Erro ao buscar o status do tenant:", error);
    return res.status(500).json({ error: "Erro ao buscar o status do tenant" });
  }
};

export const setTenantOpenClose = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;

  if (!tenantSlug) {
    return res.status(400).json({ error: "Tenant slug não fornecido." });
  }

  try {
    // Busca o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Alterna o status de "aberto"
    const updatedTenant = await prisma.tenant.update({
      where: { slug: tenantSlug },
      data: { OnClose: !tenant.OnClose },
    });

    res.status(200).json({
      message: `Status da loja atualizado para ${
        updatedTenant.OnClose ? "Aberto" : "Fechado"
      }.`,
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status da loja." });
  }
};

export const getAllTenantByUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho Authorization

  if (!token) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido." });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Busca todos os tenants associados ao userId do token
    const tenants = await prisma.userTenant.findMany({
      where: { userId: decoded.id },
      select: {
        tenant: {
          select: {
            id: true,
            nome: true,
            slug: true,
            img: true,
            OnClose: true,
          },
        },
        role: true, // Inclui o papel do usuário para o tenant
      },
    });

    // Verifica se o usuário está associado a algum tenant
    if (tenants.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum tenant associado a este usuário." });
    }

    // Mapeia os tenants para enviar apenas os dados necessários na resposta
    const tenantData = tenants.map((userTenant) => ({
      id: userTenant.tenant.id,
      name: userTenant.tenant.nome,
      slug: userTenant.tenant.slug,
      OnClose: userTenant.tenant.OnClose,
      img: userTenant.tenant.img,
      role: userTenant.role,
    }));

    res.status(200).json(tenantData);
  } catch (error) {
    console.error("Erro ao buscar tenants:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token inválido." });
    }

    res.status(500).json({ error: "Erro ao buscar tenants", details: error });
  } finally {
    await prisma.$disconnect();
  }
};
