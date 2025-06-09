"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCupom = exports.cupomToggleStatus = exports.deleteCupom = exports.updateCupom = exports.createCupom = exports.getCuponsByTenant = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Schema de validação
const cupomSchema = zod_1.z.object({
    codigo: zod_1.z.string(),
    desconto: zod_1.z.number(),
    tipoDesconto: zod_1.z.string(),
    validade: zod_1.z.string().datetime().optional(),
    dataInicio: zod_1.z.string().datetime().optional(),
    limiteUso: zod_1.z.number().optional(),
    usosAtuais: zod_1.z.number().optional(),
    valorMinimo: zod_1.z.number().optional(),
    descricao: zod_1.z.string().optional(),
    ativo: zod_1.z.boolean().default(true),
});
// Obter Cupons por Tenant
const getCuponsByTenant = async (req, res) => {
    try {
        const tenantSlug = req.params.tenantSlug;
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                cupons: true,
            },
        });
        if (tenant) {
            res.json(tenant.cupons);
        }
        else {
            res.status(404).send("Tenant não encontrado");
        }
    }
    catch (error) {
        console.error("Erro ao obter Cupons:", error);
        res.status(500).send("Erro ao obter Cupons");
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCuponsByTenant = getCuponsByTenant;
// Criar Cupom
const createCupom = async (req, res) => {
    try {
        const tenantSlug = req.params.tenantSlug;
        const data = req.body;
        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Validar dados
        const validatedData = cupomSchema.safeParse(data);
        if (!validatedData.success) {
            return res.status(400).json({ error: validatedData.error });
        }
        // Criar cupom
        const newCupom = await prisma.cupons.create({
            data: {
                ...validatedData.data,
                tenantId: tenant.id,
            },
        });
        res.status(201).json(newCupom);
    }
    catch (error) {
        console.error("Erro ao criar cupom:", error);
        res.status(500).json({ error: "Erro ao criar cupom" });
    }
};
exports.createCupom = createCupom;
// Editar Cupom
const updateCupom = async (req, res) => {
    try {
        const { cupomId } = req.params;
        const tenantSlug = req.params.tenantSlug;
        const data = req.body;
        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Verificar se cupom existe e pertence ao tenant
        const existingCupom = await prisma.cupons.findFirst({
            where: {
                id: parseInt(cupomId),
                tenantId: tenant.id,
            },
        });
        if (!existingCupom) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }
        // Validar dados
        const validatedData = cupomSchema.partial().safeParse(data);
        if (!validatedData.success) {
            return res.status(400).json({ error: validatedData.error });
        }
        // Atualizar cupom
        const updatedCupom = await prisma.cupons.update({
            where: { id: parseInt(cupomId) },
            data: validatedData.data,
        });
        res.json(updatedCupom);
    }
    catch (error) {
        console.error("Erro ao atualizar cupom:", error);
        res.status(500).json({ error: "Erro ao atualizar cupom" });
    }
};
exports.updateCupom = updateCupom;
// Deletar Cupom
const deleteCupom = async (req, res) => {
    try {
        const { cupomId } = req.params;
        const tenantSlug = req.params.tenantSlug;
        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Verificar se cupom existe e pertence ao tenant
        const existingCupom = await prisma.cupons.findFirst({
            where: {
                id: parseInt(cupomId),
                tenantId: tenant.id,
            },
        });
        if (!existingCupom) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }
        // Deletar cupom
        await prisma.cupons.delete({
            where: { id: parseInt(cupomId) },
        });
        res.json({ message: "Cupom deletado com sucesso" });
    }
    catch (error) {
        console.error("Erro ao deletar cupom:", error);
        res.status(500).json({ error: "Erro ao deletar cupom" });
    }
};
exports.deleteCupom = deleteCupom;
// Toggle status do cupom (ativo/inativo)
const cupomToggleStatus = async (req, res) => {
    try {
        const { cupomId } = req.params;
        const tenantSlug = req.params.tenantSlug;
        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Verificar se cupom existe e pertence ao tenant
        const cupom = await prisma.cupons.findFirst({
            where: {
                id: parseInt(cupomId),
                tenantId: tenant.id,
            },
        });
        if (!cupom) {
            return res.status(404).json({ error: "Cupom não encontrado" });
        }
        // Inverter o status atual do cupom
        const updatedCupom = await prisma.cupons.update({
            where: { id: parseInt(cupomId) },
            data: {
                ativo: !cupom.ativo,
            },
        });
        res.json({
            message: `Cupom ${updatedCupom.ativo ? "ativado" : "desativado"} com sucesso`,
            ativo: updatedCupom.ativo,
        });
    }
    catch (error) {
        console.error("Erro ao alterar status do cupom:", error);
        res.status(500).json({ error: "Erro ao alterar status do cupom" });
    }
};
exports.cupomToggleStatus = cupomToggleStatus;
// Validar Cupom
const validateCupom = async (req, res) => {
    try {
        const { codigo } = req.params;
        const tenantSlug = req.params.tenantSlug;
        // Buscar tenant
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ message: "Tenant não encontrado" });
        }
        // Buscar cupom
        const cupom = await prisma.cupons.findFirst({
            where: {
                codigo,
                tenantId: tenant.id,
            },
        });
        if (!cupom) {
            return res.status(404).json({ message: "Cupom não encontrado" });
        }
        // Verificar se está ativo
        if (!cupom.ativo) {
            return res.status(400).json({ message: "Cupom inativo" });
        }
        // Verificar data de validade
        if (cupom.validade && new Date(cupom.validade) < new Date()) {
            return res.status(400).json({ message: "Cupom expirado" });
        }
        // Verificar data de início
        if (cupom.dataInicio && new Date(cupom.dataInicio) > new Date()) {
            return res.status(400).json({ message: "Cupom ainda não está válido" });
        }
        // Verificar limite de uso
        if (cupom.limiteUso && cupom.usosAtuais >= cupom.limiteUso) {
            return res
                .status(400)
                .json({ message: "Limite de uso do cupom atingido" });
        }
        // Cupom válido
        return res.json({
            valid: true,
            cupom: {
                id: cupom.id,
                codigo: cupom.codigo,
                desconto: cupom.desconto,
                tipoDesconto: cupom.tipoDesconto,
                valorMinimo: cupom.valorMinimo,
            },
        });
    }
    catch (error) {
        console.error("Erro ao validar cupom:", error);
        res.status(500).json({ message: "Erro ao validar cupom" });
    }
};
exports.validateCupom = validateCupom;
