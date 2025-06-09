"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOperador = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const verifyOperador = async (req, res, next) => {
    try {
        const { tenantSlug } = req.params;
        const { operadorId, operadorSenha } = req.body;
        if (!operadorId || !operadorSenha) {
            return res
                .status(400)
                .json({ error: "Operador e senha são obrigatórios" });
        }
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        const operador = await prisma.userTenant.findFirst({
            where: {
                operadorId: operadorId,
                tenantId: tenant.id,
                active: true,
            },
        });
        if (!operador || !operador.operadorSenha) {
            return res.status(401).json({ error: "Operador não encontrado" });
        }
        // Verifica se a senha está hasheada (começa com $2b$ do bcrypt)
        const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
            ? await bcrypt_1.default.compare(operadorSenha, operador.operadorSenha)
            : operadorSenha === operador.operadorSenha;
        if (!senhaCorreta) {
            return res.status(401).json({ error: "Senha incorreta" });
        }
        // Verifica se o operador já está em outro PDV
        const pdvOperador = await prisma.pdvFrenteDeCaixa.findFirst({
            where: {
                tenantId: tenant.id,
                userTenantId: operador.id,
                status: "ABERTO",
            },
        });
        if (pdvOperador) {
            return res.status(400).json({ error: "Operador já está em outro PDV" });
        }
        // Muda de req.operador para res.locals.operador
        res.locals.operador = operador;
        next();
    }
    catch (error) {
        console.error("Erro ao verificar operador:", error);
        return res.status(500).json({ error: "Erro ao verificar operador" });
    }
};
exports.verifyOperador = verifyOperador;
