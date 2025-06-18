import { Request, RequestHandler, Response } from "express";
import { signupSchema } from "../schema/signup";
import {
  creatUser,
  findUserByEmail,
  findUserByResetToken,
  updateUser,
} from "../services/user";
import { createJWT, gerarToken } from "../middlewares/jwt";
import { signinSchema } from "../schema/signin";
import { ExtendedRequest } from "../types/extended-request";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";
import { resetPasswordSchema } from "../schema/forgot";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

export const signup: RequestHandler = async (req, res) => {
  const safeData = signupSchema.safeParse(req.body);

  // Verifica erros de validação
  if (!safeData.success) {
    console.log("Erros de validação:", safeData.error.flatten().fieldErrors);
    return res.status(400).json({
      error: "Erro de validação",
      details: safeData.error.flatten().fieldErrors, // Retorna detalhes de cada campo com erro
    });
  }

  // Verifica se o email já existe
  try {
    const hasEmail = await findUserByEmail(safeData.data.email);
    if (hasEmail) {
      return res.status(409).json({
        error: "Email já cadastrado",
        message:
          "Este email já está registrado. Por favor, use outro email ou faça login.",
      });
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const hashPassword = await bcrypt.hash(safeData.data.senha, 10);
      const user = await tx.user.create({
        data: {
          nome: safeData.data.nome,
          telefone: safeData.data.telefone,
          email: safeData.data.email,
          senha: hashPassword,
        },
      });

      if (safeData.data.admin) {
        // Cria o registro de valores de faturamento, ligado diretamente ao usuário
        await tx.valoresFaturamento.create({
          data: {
            valorMensalidade: 99.9,
            valorImplantacao: 499.9,
            user: {
              connect: { id: user.id },
            },
          },
        });

        // Associa a role de admin
        await tx.userRole.create({
          data: {
            userId: user.id,
            codigo: process.env.SUPER_ADMIN_ROLE as string,
          },
        });
      }
      return user;
    });

    // Gera o token JWT
    const token = createJWT(safeData.data.email);

    return res.status(201).json({
      message: "Cadastro realizado com sucesso!",
      token,
      user: {
        nome: newUser.nome,
        email: newUser.email,
        telefone: newUser.telefone,
      },
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return res.status(500).json({
      error: "Erro no servidor",
      message:
        "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
    });
  }
};

export const signin: RequestHandler = async (req, res) => {
  const safeData = signinSchema.safeParse(req.body);
  if (!safeData.success) {
    return res.json({ error: safeData.error.flatten().fieldErrors });
  }

  const user = await findUserByEmail(safeData.data.email);
  if (!user) {
    return res.status(401).json({ error: "Dados inválidos" });
  }

  const verifyPass = await bcrypt.compare(safeData.data.senha, user.senha); // Comparar a senha
  if (!verifyPass) {
    return res.status(401).json({ error: "Dados inválidos" });
  }

  const token = gerarToken(user.email, user.id);

  res.json({
    token,
    user: {
      nome: user.nome,
      email: user.email,
      telefone: user.telefone,
      id: user.id,
    },
  });
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

export const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email, tenantSlug, img, main_color } = req.body;

  try {
    // Verifica se o usuário existe
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: "Email não encontrado",
        message: "Este email não está registrado em nossa base de dados.",
      });
    }

    // Gera um token de redefinição e define uma expiração
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 3600000); // Expira em 1 hora

    // Atualiza o usuário com o token e a data de expiração
    await updateUser(user.id, { resetToken, tokenExpiry });

    // Envia o email com o link de redefinição de senha
    const resetLink = `${process.env.URL_APP}/${tenantSlug}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink, tenantSlug, img, main_color);

    return res.status(200).json({
      message: "Verifique seu email para redefinir a senha.",
    });
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    return res.status(500).json({
      error: "Erro no servidor",
      message:
        "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
    });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  const safeData = resetPasswordSchema.safeParse(req.body);

  // Verifica erros de validação
  if (!safeData.success) {
    return res.status(400).json({
      error: "Erro de validação",
      details: safeData.error.flatten().fieldErrors,
    });
  }

  const { token, newPassword } = safeData.data;

  try {
    // Busca o usuário pelo token de redefinição
    const user = await findUserByResetToken(token);
    if (!user || !user.tokenExpiry || user.tokenExpiry < new Date()) {
      return res.status(400).json({
        error: "Token inválido ou expirado",
        message: "O token fornecido é inválido ou já expirou.",
      });
    }

    // Atualiza a senha do usuário e remove o token
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 salt rounds
    await updateUser(user.id, {
      senha: hashedPassword,
      resetToken: null,
      tokenExpiry: null,
    });

    return res.status(200).json({
      message: "Senha redefinida com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return res.status(500).json({
      error: "Erro no servidor",
      message:
        "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
    });
  }
};
