"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.signin = void 0;
const user_1 = require("../services/user");
const jwt_1 = require("../middlewares/jwt");
const argon2_1 = __importDefault(require("argon2"));
const signin_1 = require("../schema/signin");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const signin = async (req, res) => {
    try {
        const safeData = signin_1.signinSchema.safeParse(req.body);
        if (!safeData.success) {
            return res.json({ error: safeData.error.flatten().fieldErrors });
        }
        const user = await (0, user_1.findUserByEmail)(safeData.data.email);
        if (!user) {
            return res.status(401).json({ error: "Dados inválidos" });
        }
        const verifyPass = await argon2_1.default.verify(user.senha, safeData.data.senha);
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
        const token = (0, jwt_1.gerarToken)(user.email, user.id);
        res.json({
            token,
            user: {
                nome: user.nome,
                email: user.email,
                tenantId: userTenant.tenantId,
                role: userTenant.role,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao realizar login." });
    }
};
exports.signin = signin;
const authenticateUser = (req, // Utilize ExtendedRequest aqui
res) => {
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
exports.authenticateUser = authenticateUser;
