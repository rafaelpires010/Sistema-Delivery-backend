import { Request, Response, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Obter categorias por slug do tenant
export const getCategoriesByTenant = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching categories for tenant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// Obter categorias ativas por tenant
export const getCategoriesByTenantActive = async (
  req: Request,
  res: Response
) => {
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
  } catch (error) {
    console.error("Error fetching categories for tenant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

// Obter uma categoria específica por ID e slug do tenant
export const getCategoryById = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    await prisma.$disconnect();
  }
};

//criar categoria

const createCategorychema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  id_tenant: z.number().int().positive("ID do tenant é obrigatório"),
  img: z.string().url("Imagem deve ser uma URL válida").optional(),
});

export const createCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { nome } = req.body;
  const img = (req.file as any)?.location; // Using the S3 URL provided by multer-s3

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
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto", details: error });
  } finally {
    await prisma.$disconnect();
  }

  console.log("Dados recebidos:", req.body);
  console.log("Arquivo recebido:", req.file);
};

//editar categoria

const updateCategorySchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  img: z.string().url("Imagem deve ser uma URL válida").optional(),
});

export const updateCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { nome } = req.body;
  const categoryId = parseInt(req.params.categoryId, 10);
  const tenantSlug = req.params.tenantSlug;
  const img = (req.file as any)?.location; // Caminho da imagem no S3

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
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    res
      .status(500)
      .json({ error: "Erro ao atualizar categoria", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

//detelar categoria

export const deleteCategory: RequestHandler = async (
  req: Request,
  res: Response
) => {
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
  } catch (error) {
    console.error("Erro ao deletar categoria:", error);
    res
      .status(500)
      .json({ error: "Erro ao deletar categoria", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

//ativar/desativar categoria
export const toggleCategoryStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
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
      message: `Categoria ${
        updatedCategory.ativo ? "ativada" : "desativada"
      } com sucesso.`,
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Erro ao ativar/desativar categoria:", error);
    return res.status(500).json({
      error: "Erro ao ativar/desativar categoria",
      details: error,
    });
  }
};
