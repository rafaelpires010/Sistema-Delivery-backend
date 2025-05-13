"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllClaims = exports.getAllRoles = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const getAllRoles = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                error: "Não autorizado",
                message: "Token não fornecido",
            });
        }
        // Verifica se o token é válido
        try {
            jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN);
        }
        catch (error) {
            return res.status(401).json({
                error: "Token inválido",
                message: "Sua sessão expirou ou é inválida",
            });
        }
        const roles = await prisma.roles.findMany({
            orderBy: {
                codigo: "asc",
            },
        });
        const formattedRoles = roles.map((role) => ({
            id: role.id,
            codigo: role.codigo,
            descricao: role.role,
        }));
        return res.json({
            success: true,
            data: formattedRoles,
        });
    }
    catch (error) {
        console.error("Erro ao buscar roles:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                error: "Erro interno",
                message: "Erro ao buscar roles",
                details: error.message,
            });
        }
        return res.status(500).json({
            error: "Erro interno",
            message: "Erro desconhecido ao buscar roles",
        });
    }
};
exports.getAllRoles = getAllRoles;
const getAllClaims = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                error: "Não autorizado",
                message: "Token não fornecido",
            });
        }
        // Verifica se o token é válido
        try {
            jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN);
        }
        catch (error) {
            return res.status(401).json({
                error: "Token inválido",
                message: "Sua sessão expirou ou é inválida",
            });
        }
        const claims = await prisma.claims.findMany({
            orderBy: {
                codigo: "asc",
            },
        });
        const formattedClaims = claims.map((claim) => ({
            id: claim.id,
            codigo: claim.codigo,
            descricao: claim.claim,
        }));
        return res.json({
            success: true,
            data: formattedClaims,
        });
    }
    catch (error) {
        console.error("Erro ao buscar claims:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                error: "Erro interno",
                message: "Erro ao buscar claims",
                details: error.message,
            });
        }
        return res.status(500).json({
            error: "Erro interno",
            message: "Erro desconhecido ao buscar claims",
        });
    }
};
exports.getAllClaims = getAllClaims;
