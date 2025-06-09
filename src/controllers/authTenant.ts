import { Request, RequestHandler, Response } from "express";
import { findUserByEmail } from "../services/user";
import { createJWT, gerarToken } from "../middlewares/jwt";
import { ExtendedRequest } from "../types/extended-request";
import { signinSchema } from "../schema/signin";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
export const signin: RequestHandler = async (req, res) => {
  try {
    const safeData = signinSchema.safeParse(req.body);
    if (!safeData.success) {
      return res.json({ error: safeData.error.flatten().fieldErrors });
    }

    const user = await findUserByEmail(safeData.data.email);
    if (!user) {
      return res.status(401).json({ error: "Dados inválidos" });
    }

    // Verifica a senha usando bcrypt
    const verifyPass = await bcrypt.compare(safeData.data.senha, user.senha);
    if (!verifyPass) {
      return res.status(401).json({ error: "Dados inválidos" });
    }

    // Verifica se o usuário pertence a um tenant e obtém o role e o tenantId
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: user.id },
      select: {
        tenantId: true,
        roles: {
          select: {
            codigo: true,
          },
        },
      },
    });

    if (!userTenant) {
      return res.status(403).json({
        message: "Acesso negado: Usuário não associado a nenhum tenant.",
      });
    }

    const token = gerarToken(user.email, user.id);

    res.json({
      token,
      user: {
        nome: user.nome,
        email: user.email,
        tenantId: userTenant.tenantId,
        roles: userTenant.roles.map((r) => r.codigo),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
};

export const signinSuperAdmin: RequestHandler = async (req, res) => {
  try {
    const safeData = signinSchema.safeParse(req.body);
    if (!safeData.success) {
      return res.json({ error: safeData.error.flatten().fieldErrors });
    }

    const user = await findUserByEmail(safeData.data.email);
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(
      safeData.data.senha,
      user.senha
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const adminAccess = await prisma.userRole.findFirst({
      where: {
        userId: user.id,
        role: {
          codigo: process.env.SUPER_ADMIN_ROLE,
        },
      },
    });

    if (!adminAccess) {
      return res
        .status(403)
        .json({ message: "Acesso negado. Você não é um administrador." });
    }

    const token = gerarToken(user.email, user.id);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao realizar login de administrador." });
  }
};

export const authenticateUser: RequestHandler = async (
  req: ExtendedRequest,
  res: Response
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  const userTenant = await prisma.userTenant.findFirst({
    where: { userId: user.id },
    select: { cargo: true },
  });

  res.json({
    user: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      id: user.id,
      cargo: userTenant?.cargo,
    },
  });
};
