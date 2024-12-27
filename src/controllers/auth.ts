import { Request, RequestHandler, Response } from "express";
import { signupSchema } from "../schema/signup";
import {
  creatUser,
  findUserByEmail,
  findUserByResetToken,
  updateUser,
} from "../services/user";
import { createJWT, gerarToken } from "../middlewares/jwt";
import argon2 from "argon2";
import { signinSchema } from "../schema/signin";
import { ExtendedRequest } from "../types/extended-request";
import { sendPasswordResetEmail } from "../services/email";
import crypto from "crypto";
import { resetPasswordSchema } from "../schema/forgot";

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

    // Cria a senha com hash e o usuário
    const hashPassword = await argon2.hash(safeData.data.senha);
    const newUser = await creatUser({
      nome: safeData.data.nome,
      telefone: safeData.data.telefone,
      email: safeData.data.email,
      senha: hashPassword,
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

  const verifyPass = await argon2.verify(user.senha, safeData.data.senha);
  if (!verifyPass) {
    return res.status(401).json({ error: "Dados inválidos" });
  }

  const token = gerarToken(user.email, user.id);

  res.json({
    token,
    user: {
      nome: user.nome,
    },
  });
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

export const requestPasswordReset: RequestHandler = async (req, res) => {
  const { email, tenantSlug } = req.body;

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
    const resetLink = `localhost:3001/${tenantSlug}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink, tenantSlug);

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
    const hashedPassword = await argon2.hash(newPassword);
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
