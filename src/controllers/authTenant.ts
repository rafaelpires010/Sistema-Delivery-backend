import { Request, RequestHandler, Response } from "express";
import { findUserByEmail } from "../services/user";
import { createJWT, gerarToken } from "../middlewares/jwt";
import argon2 from "argon2";
import { ExtendedRequest } from "../types/extended-request";
import { signinSchema } from "../schema/signin";
import { PrismaClient } from "@prisma/client";

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

    const verifyPass = await argon2.verify(user.senha, safeData.data.senha);
    if (!verifyPass) {
      return res.status(401).json({ error: "Dados inválidos" });
    }

    // Verifica se o usuário pertence a um tenant e obtém o role e o tenantId
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: user.id },
      select: { tenantId: true, role: true },
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
        role: userTenant.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao realizar login." });
  }
};

export const authenticateUser: RequestHandler = (
  req: ExtendedRequest, // Utilize ExtendedRequest aqui
  res: Response
) => {
  const user = req.user; // Acessa o usuário do req

  // Verifica se o usuário existe
  if (!user) {
    return res.status(401).json({ error: "Usuário não autenticado." });
  }

  // Retorna os dados do usuário
  res.json({
    user: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      id: user.id,
    },
  });
};
