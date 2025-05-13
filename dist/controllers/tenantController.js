"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantEnder = exports.updateTenantZone = exports.updateTenantFunc = exports.updateTenantInfos = exports.updateTenantLayout = exports.getAllTenantByUser = exports.setTenantOpenClose = exports.getTenantOpenClose = exports.getTenantBySlug = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Tenant_1 = require("../schema/Tenant");
const TenantInfo_1 = require("../schema/TenantInfo");
const zone_1 = require("../schema/zone");
const TenantFunc_1 = require("../schema/TenantFunc");
const TenantEndec_1 = require("../schema/TenantEndec");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.DEFAULT_TOKEN || "default_secret";
const getTenantBySlug = async (req, res) => {
    try {
        const tenantSlug = req.params.tenantSlug;
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            include: {
                tenantInfo: true, // Inclui os dados da tabela TenantInfo
                tipoRece: true, // Inclui os dados da tabela TenantTipoRece
                tenantFuncionamento: true, // Inclui os dados da tabela TenantFuncionamento
                zone: true,
                banners: true,
            },
        });
        if (tenant) {
            res.json(tenant);
        }
        else {
            res.status(404).send("Tenant não encontrado");
        }
    }
    catch (error) {
        console.error("Erro ao obter informações do tenant:", error);
        res.status(500).send("Erro ao obter informações do tenant");
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getTenantBySlug = getTenantBySlug;
const getTenantOpenClose = async (req, res) => {
    const { tenantSlug } = req.params;
    try {
        // Consulta no banco de dados para encontrar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
            select: { OnClose: true }, // Seleciona apenas o campo `isOpen`
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Retorna o status atual do tenant (aberto/fechado)
        return res.status(200).json({ isOpen: tenant.OnClose });
    }
    catch (error) {
        console.error("Erro ao buscar o status do tenant:", error);
        return res.status(500).json({ error: "Erro ao buscar o status do tenant" });
    }
};
exports.getTenantOpenClose = getTenantOpenClose;
const setTenantOpenClose = async (req, res) => {
    const { tenantSlug } = req.params;
    if (!tenantSlug) {
        return res.status(400).json({ error: "Tenant slug não fornecido." });
    }
    try {
        // Busca o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Alterna o status de "aberto"
        const updatedTenant = await prisma.tenant.update({
            where: { slug: tenantSlug },
            data: { OnClose: !tenant.OnClose },
        });
        res.status(200).json({
            message: `Status da loja atualizado para ${updatedTenant.OnClose ? "Aberto" : "Fechado"}.`,
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar status da loja." });
    }
};
exports.setTenantOpenClose = setTenantOpenClose;
const getAllTenantByUser = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho Authorization
    if (!token) {
        return res
            .status(401)
            .json({ error: "Token de autenticação não fornecido." });
    }
    try {
        // Verifica e decodifica o token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Busca todos os tenants associados ao userId do token
        const tenants = await prisma.userTenant.findMany({
            where: { userId: decoded.id },
            select: {
                tenant: {
                    select: {
                        id: true,
                        nome: true,
                        slug: true,
                        img: true,
                        OnClose: true,
                    },
                },
                roles: {
                    select: {
                        codigo: true,
                    },
                },
            },
        });
        // Verifica se o usuário está associado a algum tenant
        if (tenants.length === 0) {
            return res
                .status(404)
                .json({ error: "Nenhum tenant associado a este usuário." });
        }
        // Mapeia os tenants para enviar apenas os dados necessários na resposta
        const tenantData = tenants.map((userTenant) => ({
            id: userTenant.tenant.id,
            nome: userTenant.tenant.nome,
            slug: userTenant.tenant.slug,
            OnClose: userTenant.tenant.OnClose,
            img: userTenant.tenant.img,
            roles: userTenant.roles.map((r) => r.codigo),
        }));
        res.status(200).json(tenantData);
    }
    catch (error) {
        console.error("Erro ao buscar tenants:", error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({ error: "Token inválido." });
        }
        res.status(500).json({ error: "Erro ao buscar tenants", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getAllTenantByUser = getAllTenantByUser;
const updateTenantLayout = async (req, res) => {
    const tenantId = parseInt(req.params.tenantId, 10);
    // Verificar se o ID do tenant é válido
    if (isNaN(tenantId)) {
        return res.status(400).json({ error: "ID do Tenant inválido." });
    }
    // Extrair os campos textuais do corpo da requisição
    const { nome, main_color, second_color } = req.body;
    // Extrair o arquivo da imagem do upload (via Multer)
    const img = req.file?.location || req.file?.path; // Ajuste dependendo do local de armazenamento
    // Validar se ao menos um campo foi fornecido
    if (!nome && !main_color && !second_color && !img) {
        return res.status(400).json({
            error: "É necessário fornecer ao menos um campo para atualização (nome, cor principal, cor secundária, imagem).",
        });
    }
    try {
        // Buscar o tenant pelo ID
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Preparar os dados para atualização
        const data = {
            nome: nome ?? tenant.nome,
            main_color: main_color ?? tenant.main_color,
            second_color: second_color ?? tenant.second_color,
            img: img ?? tenant.img, // Usa a nova imagem, se fornecida
        };
        // Validar os dados com o schema
        const validationResult = Tenant_1.updateTenantSchema.safeParse(data);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: validationResult.error.issues,
            });
        }
        // Atualizar os dados do tenant
        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: validationResult.data, // Dados validados
        });
        // Retornar a resposta com a confirmação da atualização
        res.status(200).json({
            message: "Layout do tenant atualizado com sucesso.",
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar layout do tenant:", error);
        res.status(500).json({ error: "Erro ao atualizar layout do tenant." });
    }
};
exports.updateTenantLayout = updateTenantLayout;
const updateTenantInfos = async (req, res) => {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
        return res.status(400).json({ error: "ID do Tenant inválido." });
    }
    const { cnpj, telefone, whatsapp, instagram } = req.body;
    console.log(cnpj, telefone, whatsapp, instagram);
    if (!cnpj && !telefone && !whatsapp && !instagram) {
        return res.status(400).json({
            error: "É necessário fornecer ao menos um campo para atualização.",
        });
    }
    try {
        const tenantInfo = await prisma.tenantInfo.findUnique({
            where: { tenantId: tenantId },
        });
        if (!tenantInfo) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        const data = {
            cnpj: cnpj ?? tenantInfo.cnpj,
            telefone: telefone ?? tenantInfo.telefone,
            whatsapp: whatsapp ?? tenantInfo.whatsapp,
            instagram: instagram ?? tenantInfo.instagram,
        };
        const validationResult = TenantInfo_1.updateTenantInfosSchema.safeParse(data);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: validationResult.error.issues,
            });
        }
        const updatedTenant = await prisma.tenantInfo.update({
            where: { tenantId: tenantId },
            data: validationResult.data,
        });
        res.status(200).json({
            message: "Informações do tenant atualizadas com sucesso.",
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar informações do tenant:", error);
        res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
    }
};
exports.updateTenantInfos = updateTenantInfos;
const updateTenantFunc = async (req, res) => {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
        return res.status(400).json({ error: "ID do Tenant inválido." });
    }
    const { segOpen, segClose, terOpen, terClose, quarOpen, quarClose, quinOpen, quinClose, sexOpen, sexClose, sabOpen, sabClose, domOpen, domClose, } = req.body;
    if (!segOpen &&
        !segClose &&
        !terOpen &&
        !terClose &&
        !quarOpen &&
        !quarClose &&
        !quinOpen &&
        !quinClose &&
        !sexOpen &&
        !sexClose &&
        !sabOpen &&
        !sabClose &&
        !domOpen &&
        !domClose) {
        return res.status(400).json({
            error: "É necessário fornecer ao menos um campo para atualização.",
        });
    }
    try {
        const tenantFunc = await prisma.tenantFuncionamento.findUnique({
            where: { tenantId: tenantId },
        });
        if (!tenantFunc) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        const data = {
            segOpen: segOpen ?? tenantFunc.segOpen,
            segClose: segClose ?? tenantFunc.segClose,
            terOpen: terOpen ?? tenantFunc.terOpen,
            terClose: terClose ?? tenantFunc.terClose,
            quaOpen: quarOpen ?? tenantFunc.quarOpen,
            quaClose: quarClose ?? tenantFunc.quarClose,
            quiOpen: quinOpen ?? tenantFunc.quinOpen,
            quiClose: quinClose ?? tenantFunc.quinClose,
            sexOpen: sexOpen ?? tenantFunc.sexOpen,
            sexClose: sexClose ?? tenantFunc.sexClose,
            sabOpen: sabOpen ?? tenantFunc.sabOpen,
            sabClose: sabClose ?? tenantFunc.sabClose,
            domOpen: domOpen ?? tenantFunc.domOpen,
            domClose: domClose ?? tenantFunc.domClose,
        };
        const validationResult = TenantFunc_1.updateTenantFuncSchema.safeParse(data);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: validationResult.error.issues,
            });
        }
        const updatedTenant = await prisma.tenantFuncionamento.update({
            where: { tenantId: tenantId },
            data: validationResult.data,
        });
        res.status(200).json({
            message: "Informações de Horarios de Funcionamento atualizadas com sucesso.",
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar informações do tenant:", error);
        res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
    }
};
exports.updateTenantFunc = updateTenantFunc;
const updateTenantZone = async (req, res) => {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
        return res.status(400).json({ error: "ID do Tenant inválido." });
    }
    const { maxDistanceKm, fixedFee, additionalKmFee, fixedDistanceKm, tempoMaxEntre, } = req.body;
    if (!maxDistanceKm &&
        !fixedFee &&
        !additionalKmFee &&
        !fixedDistanceKm &&
        !tempoMaxEntre) {
        return res.status(400).json({
            error: "É necessário fornecer ao menos um campo para atualização.",
        });
    }
    try {
        const tenantZone = await prisma.zone.findUnique({
            where: { tenantId: tenantId },
        });
        if (!tenantZone) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        const data = {
            maxDistanceKm: maxDistanceKm ?? tenantZone.maxDistanceKm,
            fixedFee: fixedFee ?? tenantZone.fixedFee,
            additionalKmFee: additionalKmFee ?? tenantZone.additionalKmFee,
            fixedDistanceKm: fixedDistanceKm ?? tenantZone.fixedDistanceKm,
            tempoMaxEntre: tempoMaxEntre ?? tenantZone.tempoMaxEntre,
        };
        const validationResult = zone_1.updateTenantZoneSchema.safeParse(data);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: validationResult.error.issues,
            });
        }
        const updatedTenant = await prisma.zone.update({
            where: { tenantId: tenantId },
            data: validationResult.data,
        });
        res.status(200).json({
            message: "Informações do tenantZone atualizadas com sucesso.",
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar informações do tenant:", error);
        res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
    }
};
exports.updateTenantZone = updateTenantZone;
const updateTenantEnder = async (req, res) => {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
        return res.status(400).json({ error: "ID do Tenant inválido." });
    }
    const { cep, rua, cidade, estado, numero, bairro } = req.body;
    if (!cep && !rua && !cidade && !estado && !numero && !bairro) {
        return res.status(400).json({
            error: "É necessário fornecer ao menos um campo para atualização.",
        });
    }
    try {
        const tenantInfo = await prisma.tenantInfo.findUnique({
            where: { tenantId: tenantId },
        });
        if (!tenantInfo) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        const data = {
            cep: cep ?? tenantInfo.cep,
            rua: rua ?? tenantInfo.rua,
            numero: numero ?? tenantInfo.numero,
            bairro: bairro ?? tenantInfo.bairro,
            cidade: cidade ?? tenantInfo.cidade,
            estado: estado ?? tenantInfo.estado,
        };
        const validationResult = TenantEndec_1.updateTenantEndecSchema.safeParse(data);
        if (!validationResult.success) {
            return res.status(400).json({
                error: "Dados inválidos",
                details: validationResult.error.issues,
            });
        }
        const updatedTenant = await prisma.tenantInfo.update({
            where: { tenantId: tenantId },
            data: validationResult.data,
        });
        res.status(200).json({
            message: "Informações do tenant atualizadas com sucesso.",
            tenant: updatedTenant,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar informações do tenant:", error);
        res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
    }
};
exports.updateTenantEnder = updateTenantEnder;
