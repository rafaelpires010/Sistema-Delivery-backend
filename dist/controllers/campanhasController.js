"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampanha = exports.deleteCampanha = exports.createCampanha = exports.getCampanhaById = exports.getCampanhasByTenant = void 0;
const client_1 = require("@prisma/client");
const Campanha_1 = require("../schema/Campanha");
const prisma = new client_1.PrismaClient();
const getCampanhasByTenant = async (req, res) => {
    try {
        const tenantSlug = req.params.tenantSlug;
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                campanhas: {
                    include: {
                        cupom: true,
                    },
                },
            },
        });
        if (tenant) {
            res.json(tenant.campanhas);
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
exports.getCampanhasByTenant = getCampanhasByTenant;
const getCampanhaById = async (req, res) => {
    try {
        const { tenantSlug, campanhaId } = req.params;
        if (!tenantSlug || !campanhaId) {
            return res.status(400).json({ message: "Parâmetros inválidos" });
        }
        const id = parseInt(campanhaId, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID da campanha inválido" });
        }
        // Buscar o campanha pelo ID e verificar se pertence ao tenant correto
        const campanha = await prisma.campanhas.findFirst({
            where: {
                id: id,
                tenant: {
                    slug: tenantSlug,
                },
            },
            include: {
                cupom: true, // Inclua a relação 'cupom'
            },
        });
        if (campanha) {
            res.json(campanha);
        }
        else {
            res
                .status(404)
                .json({ message: "Campanha não encontrada ou não acessível" });
        }
    }
    catch (error) {
        console.error("Erro ao buscar campanha:", error);
        res.status(500).json({ message: "Erro interno do servidor" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCampanhaById = getCampanhaById;
//criar campanha
const createCampanha = async (req, res) => {
    try {
        const { nome, cupomId, descricao } = req.body;
        const img = req.file?.location; // URL do S3 fornecida pelo multer-s3
        const tenantSlug = req.params.tenantSlug;
        console.log("Recebido:", { nome, descricao, cupomId, img });
        // Validação inicial
        if (!nome || !descricao || !img || typeof cupomId !== "string") {
            return res.status(400).json({
                error: "Todos os campos obrigatórios devem ser preenchidos corretamente.",
            });
        }
        // Converte id_cupom para número e verifica se é válido
        const idCupom = parseInt(cupomId, 10);
        if (isNaN(idCupom)) {
            return res.status(400).json({ error: "ID do cupom inválido." });
        }
        // Busca o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Verifica se o cupom pertence ao tenant
        const cupom = await prisma.cupons.findFirst({
            where: {
                id: idCupom,
                tenantId: tenant.id,
            },
        });
        if (!cupom) {
            return res
                .status(404)
                .json({ error: "Cupom não encontrado ou não pertence ao tenant." });
        }
        // Dados formatados para criação
        const data = {
            nome,
            img,
            cupomId: idCupom,
            descricao: descricao ?? "",
            ativo: true,
            tenantId: tenant.id,
        };
        // Validação do schema Zod
        const body = Campanha_1.createCampanhaSchema.safeParse(data);
        if (!body.success) {
            return res
                .status(400)
                .json({ error: "Dados inválidos", details: body.error.issues });
        }
        // Criar a campanha
        const newCampanha = await prisma.campanhas.create({
            data: {
                nome: body.data.nome,
                img: body.data.img,
                cupomId: body.data.cupomId, // Corrigido para corresponder à tabela
                descricao: body.data.descricao,
                tenantId: body.data.tenantId, // Correção do nome
            },
        });
        res.status(201).json(newCampanha);
    }
    catch (error) {
        console.error("Erro ao criar campanha:", error);
        res
            .status(500)
            .json({ error: "Erro interno ao criar campanha", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.createCampanha = createCampanha;
//deletar campanha
const deleteCampanha = async (req, res) => {
    const campanhaId = parseInt(req.params.campanhaId, 10);
    const tenantSlug = req.params.tenantSlug;
    if (isNaN(campanhaId)) {
        return res.status(400).json({ error: "ID da campanha inválido." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Verificar se o produto pertence ao tenant
        const campanha = await prisma.campanhas.findFirst({
            where: {
                id: campanhaId,
                tenantId: tenant.id,
            },
        });
        if (!campanha) {
            return res
                .status(404)
                .json({ error: "Campanha não encontrada ou não pertence ao tenant." });
        }
        // Deletar o produto
        await prisma.campanhas.delete({
            where: { id: campanhaId },
        });
        res.status(200).json({ message: "Campanha deletada com sucesso." });
    }
    catch (error) {
        console.error("Erro ao deletar campanha:", error);
        res.status(500).json({ error: "Erro ao deletar campanha", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.deleteCampanha = deleteCampanha;
//editar campanha
const updateCampanha = async (req, res) => {
    const { nome, descricao } = req.body;
    const img = req.file?.location; // Caminho da imagem no S3
    const campanhaId = parseInt(req.params.campanhaId, 10);
    const tenantSlug = req.params.tenantSlug;
    // Verificar se o ID do produto é válido
    if (isNaN(campanhaId)) {
        return res.status(400).json({ error: "ID da campanha inválido." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Verificar se o produto pertence ao tenant
        const campanha = await prisma.campanhas.findFirst({
            where: {
                id: campanhaId,
                tenantId: tenant.id,
            },
        });
        if (!campanha) {
            return res
                .status(404)
                .json({ error: "Campanha não encontrada ou não pertence ao tenant." });
        }
        // Prepara os dados para atualização
        const data = {
            nome: nome ?? campanha.nome,
            img: img ? img : campanha.img,
            descricao: descricao ?? campanha.descricao,
            cupomId: req.body.cupomId
                ? parseInt(req.body.cupomId, 10)
                : campanha.cupomId,
            ativo: req.body.ativo ?? campanha.ativo,
        };
        // Validar os dados com o schema
        const body = Campanha_1.updateCampanhaSchema.safeParse(data);
        if (!body.success) {
            return res
                .status(400)
                .json({ error: "Dados inválidos", details: body.error.issues });
        }
        // Atualizar o produto no banco de dados
        const updatedCampanha = await prisma.campanhas.update({
            where: { id: campanhaId },
            data: body.data,
        });
        res.status(200).json(updatedCampanha);
    }
    catch (error) {
        console.error("Erro ao atualizar campanha:", error);
        res
            .status(500)
            .json({ error: "Erro ao atualizar campanha", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateCampanha = updateCampanha;
