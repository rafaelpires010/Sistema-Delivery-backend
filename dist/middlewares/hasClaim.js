"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeClaim = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const authorizeClaim = (requiredClaim) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const { tenantSlug } = req.params;
            if (!token) {
                return res.status(401).json({ message: "Token não fornecido" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN);
            // Primeiro encontra o userTenant
            const userTenant = await prisma.userTenant.findFirst({
                where: {
                    userId: decoded.id,
                    tenant: {
                        slug: tenantSlug,
                    },
                },
            });
            if (!userTenant) {
                return res
                    .status(403)
                    .json({ message: "Usuário não pertence ao tenant" });
            }
            // Verifica se o userTenant tem a claim necessária
            const hasClaim = await prisma.tenantUserClaims.findFirst({
                where: {
                    userTenantId: userTenant.id,
                    codigo: requiredClaim,
                },
            });
            if (!hasClaim) {
                return res.status(403).json({ message: "Permissão insuficiente" });
            }
            next();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro ao verificar permissões" });
        }
    };
};
exports.authorizeClaim = authorizeClaim;
