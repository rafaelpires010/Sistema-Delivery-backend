"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleCategoryStatus = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategoriesByTenantActive = exports.getCategoriesByTenant = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Obter categorias por slug do tenant
const getCategoriesByTenant = async (req, res) => {
    const { tenantSlug } = req.params;
    try {
        // Verifica se o tenant existe
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }
        // Busca as categorias associadas ao tenant
        const categories = await prisma.category.findMany({
            where: { id_tenant: tenant.id },
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching categories for tenant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCategoriesByTenant = getCategoriesByTenant;
// Obter categorias ativas por tenant
const getCategoriesByTenantActive = async (req, res) => {
    const { tenantSlug } = req.params;
    try {
        // Verifica se o tenant existe
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }
        // Busca as categorias associadas ao tenant
        const categories = await prisma.category.findMany({
            where: { id_tenant: tenant.id, ativo: true },
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Error fetching categories for tenant:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCategoriesByTenantActive = getCategoriesByTenantActive;
// Obter uma categoria específica por ID e slug do tenant
const getCategoryById = async (req, res) => {
    const { tenantSlug, categoryId } = req.params;
    try {
        // Verifica se o tenant existe
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant not found" });
        }
        // Busca a categoria específica
        const category = await prisma.category.findUnique({
            where: { id: Number(categoryId) },
        });
        if (!category || category.id_tenant !== tenant.id) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(category);
    }
    catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getCategoryById = getCategoryById;
//criar categoria
const createCategorychema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório"),
    id_tenant: zod_1.z.number().int().positive("ID do tenant é obrigatório"),
    img: zod_1.z.string().url("Imagem deve ser uma URL válida").optional(),
});
const createCategory = async (req, res) => {
    const { nome } = req.body;
    const img = req.file?.location; // Using the S3 URL provided by multer-s3
    // ID do tenant é passado como parâmetro da URL
    const tenantSlug = req.params.tenantSlug;
    if (!nome || !tenantSlug) {
        return res
            .status(400)
            .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        const data = {
            nome,
            id_tenant: tenant.id, // Usa o ID do tenant encontrado na URL
            img,
        };
        // Validar os dados com o schema
        const body = createCategorychema.safeParse(data);
        if (!body.success) {
            return res
                .status(400)
                .json({ error: "Dados inválidos", details: body.error.issues });
        }
        // Criar o produto
        const newProduct = await prisma.category.create({
            data: {
                nome: body.data.nome,
                id_tenant: body.data.id_tenant,
                img: body.data.img,
            },
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Erro ao criar produto:", error);
        res.status(500).json({ error: "Erro ao criar produto", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
    console.log("Dados recebidos:", req.body);
    console.log("Arquivo recebido:", req.file);
};
exports.createCategory = createCategory;
//editar categoria
const updateCategorySchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório").optional(),
    img: zod_1.z.string().url("Imagem deve ser uma URL válida").optional(),
});
const updateCategory = async (req, res) => {
    const { nome } = req.body;
    const categoryId = parseInt(req.params.categoryId, 10);
    const tenantSlug = req.params.tenantSlug;
    const img = req.file?.location; // Caminho da imagem no S3
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: "ID da categoria inválido." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Buscar a categoria pelo ID e verificar se pertence ao tenant
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                id_tenant: tenant.id,
            },
        });
        if (!category) {
            return res
                .status(404)
                .json({ error: "Categoria não encontrada ou não pertence ao tenant." });
        }
        const data = {
            nome,
            img,
        };
        // Validar os dados com o schema
        const body = updateCategorySchema.safeParse(data);
        if (!body.success) {
            return res
                .status(400)
                .json({ error: "Dados inválidos", details: body.error.issues });
        }
        // Atualizar a categoria
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: body.data,
        });
        res.status(200).json(updatedCategory);
    }
    catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res
            .status(500)
            .json({ error: "Erro ao atualizar categoria", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateCategory = updateCategory;
//detelar categoria
const deleteCategory = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId, 10);
    const tenantSlug = req.params.tenantSlug;
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: "ID da categoria inválido." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Verificar se a categoria pertence ao tenant
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                id_tenant: tenant.id,
            },
        });
        if (!category) {
            return res
                .status(404)
                .json({ error: "Categoria não encontrada ou não pertence ao tenant." });
        }
        // Deletar a categoria
        await prisma.category.delete({
            where: { id: categoryId },
        });
        res.status(204).send(); // No content
    }
    catch (error) {
        console.error("Erro ao deletar categoria:", error);
        res
            .status(500)
            .json({ error: "Erro ao deletar categoria", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.deleteCategory = deleteCategory;
//ativar/desativar categoria
const toggleCategoryStatus = async (req, res) => {
    const categoryId = parseInt(req.params.categoryId, 10);
    const tenantSlug = req.params.tenantSlug;
    if (isNaN(categoryId)) {
        return res.status(400).json({ error: "ID da categoria inválido." });
    }
    try {
        // Buscar o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Buscar a categoria e verificar se pertence ao tenant
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                id_tenant: tenant.id,
            },
        });
        if (!category) {
            return res.status(404).json({
                error: "Categoria não encontrada ou não pertence ao tenant.",
            });
        }
        // Alternar o status da categoria
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                ativo: !category.ativo, // Inverte o status atual
            },
        });
        return res.status(200).json({
            success: true,
            message: `Categoria ${updatedCategory.ativo ? "ativada" : "desativada"} com sucesso.`,
            data: updatedCategory,
        });
    }
    catch (error) {
        console.error("Erro ao ativar/desativar categoria:", error);
        return res.status(500).json({
            error: "Erro ao ativar/desativar categoria",
            details: error,
        });
    }
};
exports.toggleCategoryStatus = toggleCategoryStatus;
