"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
// Middleware de autorização para verificar o papel do usuário no tenant
const authorizeRole = (requiredRole) => {
    return async (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho Authorization
        const { tenantSlug } = req.params; // ID do tenant vindo da rota
        if (!token) {
            return res
                .status(401)
                .json({ error: "Token de autenticação não fornecido." });
        }
        try {
            // Busca o tenant pelo slug
            const tenant = await prisma.tenant.findUnique({
                where: { slug: tenantSlug },
            });
            if (!tenant) {
                return res.status(404).json({ error: "Tenant não encontrado." });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN);
            // Consulta o banco para obter o papel do usuário nesse tenant
            const userTenant = await prisma.userTenant.findUnique({
                where: {
                    userId_tenantId: {
                        userId: Number(decoded.id),
                        tenantId: Number(tenant.id),
                    },
                },
            });
            if (!userTenant) {
                return res.status(403).json({
                    message: "Acesso negado: usuário não pertence a este tenant.",
                });
            }
            // Verifica se o papel do usuário corresponde ao papel necessário
            if (userTenant.role !== requiredRole) {
                return res
                    .status(403)
                    .json({ message: "Acesso negado: permissão insuficiente." });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao verificar permissões." });
        }
    };
};
exports.authorizeRole = authorizeRole;
