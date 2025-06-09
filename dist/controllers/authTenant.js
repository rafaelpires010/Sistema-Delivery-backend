"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.signin = void 0;
const user_1 = require("../services/user");
const jwt_1 = require("../middlewares/jwt");
const signin_1 = require("../schema/signin");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
        // Verifica a senha usando bcrypt
        const verifyPass = await bcrypt_1.default.compare(safeData.data.senha, user.senha);
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
        const token = (0, jwt_1.gerarToken)(user.email, user.id);
        res.json({
            token,
            user: {
                nome: user.nome,
                email: user.email,
                tenantId: userTenant.tenantId,
                roles: userTenant.roles.map((r) => r.codigo),
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao realizar login." });
    }
};
exports.signin = signin;
const authenticateUser = async (req, res) => {
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
exports.authenticateUser = authenticateUser;
