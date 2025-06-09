import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createProductSchema, updateProductSchema } from "../schema/product";

const prisma = new PrismaClient();

// Obter Produtos por Tenant
export const getProductsByTenant: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        products: {
          include: {
            category: true, // Inclui a categoria associada ao produto
          },
        },
      },
    });

    if (tenant) {
      res.json(tenant.products);
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).send("Erro ao obter produtos");
  } finally {
    await prisma.$disconnect();
  }
};

// Obter Produtos ativos por Tenant
export const getProductsByTenantActive: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        products: {
          where: {
            ativo: true,
          },
          include: {
            category: true, // Inclui a categoria associada ao produto
          },
        },
      },
    });

    if (tenant) {
      res.json(tenant.products);
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter produtos:", error);
    res.status(500).send("Erro ao obter produtos");
  } finally {
    await prisma.$disconnect();
  }
};

// Obter Produto por ID
export const getProductById: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantSlug, productId } = req.params;

    if (!tenantSlug || !productId) {
      return res.status(400).json({ message: "Parâmetros inválidos" });
    }

    const id = parseInt(productId, 10);

    if (isNaN(id)) {
      return res.status(400).json({ message: "ID do produto inválido" });
    }

    // Buscar o produto pelo ID e verificar se pertence ao tenant correto
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        tenant: {
          slug: tenantSlug,
        },
      },
      include: {
        category: true, // Inclua a relação 'categoria'
      },
    });

    if (product) {
      res.json(product);
    } else {
      res
        .status(404)
        .json({ message: "Produto não encontrado ou não acessível" });
    }
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ message: "Erro interno do servidor" });
  } finally {
    await prisma.$disconnect();
  }
};

//criar produto
export const createProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { nome, id_category, preco, descricao } = req.body;
  const img = (req.file as any)?.location; // Using the S3 URL provided by multer-s3

  // Tenant slug is passed as a URL parameter
  const tenantSlug = req.params.tenantSlug;

  if (!nome || !img || !id_category || !preco || !tenantSlug) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  const idCategory = parseInt(id_category as string, 10);
  const price = parseFloat(preco.replace(",", ".") as string);

  try {
    // Find the tenant by slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Check if the category belongs to the same tenant
    const category = await prisma.category.findFirst({
      where: {
        id: idCategory,
        id_tenant: tenant.id, // Assuming `id_tenant` is the field linking category to tenant
      },
    });

    if (!category) {
      return res
        .status(404)
        .json({ error: "Categoria não encontrada ou não pertence ao tenant." });
    }

    const data = {
      nome,
      img, // S3 URL from multer-s3
      id_category: idCategory,
      preco: price,
      descricao: descricao ?? "",
      id_tenant: tenant.id, // Use the tenant ID from the URL slug
    };

    // Validate data with schema
    const body = createProductSchema.safeParse(data);
    if (!body.success) {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: body.error.issues });
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        nome: body.data.nome,
        img: body.data.img,
        id_category: body.data.id_category,
        preco: body.data.preco,
        descricao: body.data.descricao,
        id_tenant: body.data.id_tenant,
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

//deletar produto
export const deleteProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const productId = parseInt(req.params.productId, 10);
  const tenantSlug = req.params.tenantSlug;

  if (isNaN(productId)) {
    return res.status(400).json({ error: "ID do produto inválido." });
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
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        id_tenant: tenant.id,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado ou não pertence ao tenant." });
    }

    // Deletar o produto
    await prisma.product.delete({
      where: { id: productId },
    });

    res.status(200).json({ message: "Produto deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

//editar produto
export const updateProduct: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { nome, id_category, preco, descricao } = req.body;
  const img = (req.file as any)?.location; // Caminho da imagem no S3
  const productId = parseInt(req.params.productId, 10);
  const tenantSlug = req.params.tenantSlug;

  // Verificar se o ID do produto é válido
  if (isNaN(productId)) {
    return res.status(400).json({ error: "ID do produto inválido." });
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
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        id_tenant: tenant.id,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado ou não pertence ao tenant." });
    }

    // Prepara os dados para atualização
    const data: any = {
      nome: nome ?? product.nome,
      img: img ? img : product.img, // Usa a imagem fornecida ou mantém a atual
      id_category: id_category
        ? parseInt(id_category as string, 10)
        : product.id_category,
      preco: preco ? parseFloat(preco.replace(",", ".")) : product.preco, // Garantir que preço seja convertido corretamente
      descricao: descricao ?? product.descricao,
    };

    // Validar os dados com o schema
    const body = updateProductSchema.safeParse(data);
    if (!body.success) {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: body.error.issues });
    }

    // Atualizar o produto no banco de dados
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body.data, // Dados validados
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res
      .status(500)
      .json({ error: "Erro ao atualizar produto", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

//ativar/desativar produto
export const toggleProductStatus: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const productId = parseInt(req.params.productId, 10);
  const tenantSlug = req.params.tenantSlug;

  if (isNaN(productId)) {
    return res.status(400).json({ error: "ID do produto inválido." });
  }

  try {
    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Buscar o produto e verificar se pertence ao tenant
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        id_tenant: tenant.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: "Produto não encontrado ou não pertence ao tenant.",
      });
    }

    // Alternar o status do produto
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ativo: !product.ativo, // Inverte o status atual
      },
    });

    return res.status(200).json({
      success: true,
      message: `Produto ${
        updatedProduct.ativo ? "ativado" : "desativado"
      } com sucesso.`,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Erro ao ativar/desativar produto:", error);
    return res.status(500).json({
      error: "Erro ao ativar/desativar produto",
      details: error,
    });
  }
};
