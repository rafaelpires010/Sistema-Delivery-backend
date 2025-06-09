"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.authenticateUser = exports.signin = exports.signup = void 0;
const signup_1 = require("../schema/signup");
const user_1 = require("../services/user");
const jwt_1 = require("../middlewares/jwt");
const signin_1 = require("../schema/signin");
const email_1 = require("../services/email");
const crypto_1 = __importDefault(require("crypto"));
const forgot_1 = require("../schema/forgot");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../lib/prisma");
const signup = async (req, res) => {
    const safeData = signup_1.signupSchema.safeParse(req.body);
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
        const hasEmail = await (0, user_1.findUserByEmail)(safeData.data.email);
        if (hasEmail) {
            return res.status(409).json({
                error: "Email já cadastrado",
                message: "Este email já está registrado. Por favor, use outro email ou faça login.",
            });
        }
        // Cria a senha com hash e o usuário
        const hashPassword = await bcrypt_1.default.hash(safeData.data.senha, 10); // 10 é o número de salt rounds
        const newUser = await (0, user_1.creatUser)({
            nome: safeData.data.nome,
            telefone: safeData.data.telefone,
            email: safeData.data.email,
            senha: hashPassword,
        });
        // Gera o token JWT
        const token = (0, jwt_1.createJWT)(safeData.data.email);
        return res.status(201).json({
            message: "Cadastro realizado com sucesso!",
            token,
            user: {
                nome: newUser.nome,
                email: newUser.email,
                telefone: newUser.telefone,
            },
        });
    }
    catch (error) {
        console.error("Erro ao criar usuário:", error);
        return res.status(500).json({
            error: "Erro no servidor",
            message: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.",
        });
    }
};
exports.signup = signup;
const signin = async (req, res) => {
    const safeData = signin_1.signinSchema.safeParse(req.body);
    if (!safeData.success) {
        return res.json({ error: safeData.error.flatten().fieldErrors });
    }
    const user = await (0, user_1.findUserByEmail)(safeData.data.email);
    if (!user) {
        return res.status(401).json({ error: "Dados inválidos" });
    }
    const verifyPass = await bcrypt_1.default.compare(safeData.data.senha, user.senha); // Comparar a senha
    if (!verifyPass) {
        return res.status(401).json({ error: "Dados inválidos" });
    }
    const token = (0, jwt_1.gerarToken)(user.email, user.id);
    res.json({
        token,
        user: {
            nome: user.nome,
        },
    });
};
exports.signin = signin;
const authenticateUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: "Usuário não autenticado." });
    }
    const userTenant = await prisma_1.prisma.userTenant.findFirst({
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
exports.authenticateUser = authenticateUser;
const requestPasswordReset = async (req, res) => {
    const { email, tenantSlug } = req.body;
    try {
        // Verifica se o usuário existe
        const user = await (0, user_1.findUserByEmail)(email);
        if (!user) {
            return res.status(404).json({
                error: "Email não encontrado",
                message: "Este email não está registrado em nossa base de dados.",
            });
        }
        // Gera um token de redefinição e define uma expiração
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const tokenExpiry = new Date(Date.now() + 3600000); // Expira em 1 hora
        // Atualiza o usuário com o token e a data de expiração
        await (0, user_1.updateUser)(user.id, { resetToken, tokenExpiry });
        // Envia o email com o link de redefinição de senha
        const resetLink = `localhost:3001/${tenantSlug}/reset-password?token=${resetToken}`;
        await (0, email_1.sendPasswordResetEmail)(email, resetLink, tenantSlug);
        return res.status(200).json({
            message: "Verifique seu email para redefinir a senha.",
        });
    }
    catch (error) {
        console.error("Erro ao enviar email de recuperação:", error);
        return res.status(500).json({
            error: "Erro no servidor",
            message: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    const safeData = forgot_1.resetPasswordSchema.safeParse(req.body);
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
        const user = await (0, user_1.findUserByResetToken)(token);
        if (!user || !user.tokenExpiry || user.tokenExpiry < new Date()) {
            return res.status(400).json({
                error: "Token inválido ou expirado",
                message: "O token fornecido é inválido ou já expirou.",
            });
        }
        // Atualiza a senha do usuário e remove o token
        const hashedPassword = await bcrypt_1.default.hash(newPassword, 10); // 10 salt rounds
        await (0, user_1.updateUser)(user.id, {
            senha: hashedPassword,
            resetToken: null,
            tokenExpiry: null,
        });
        return res.status(200).json({
            message: "Senha redefinida com sucesso!",
        });
    }
    catch (error) {
        console.error("Erro ao redefinir senha:", error);
        return res.status(500).json({
            error: "Erro no servidor",
            message: "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.",
        });
    }
};
exports.resetPassword = resetPassword;
