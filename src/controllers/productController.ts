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
            complements: {
              include: {
                items: true, // Inclui os ITENS dentro de cada grupo
              },
            },
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
            isComplement: false, // Apenas produtos principais
          },
          include: {
            category: true,
            complements: {
              include: {
                items: {
                  include: {
                    product: true, // Inclui o produto vinculado ao complemento
                  },
                },
              },
            },
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
        category: true,
        complements: {
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
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
  const {
    nome,
    id_category,
    preco,
    descricao,
    complementsGroupIds,
    isComplement,
  } = req.body;
  const img = (req.file as any)?.location;
  const tenantSlug = req.params.tenantSlug;

  if (!nome || !id_category || !preco) {
    return res
      .status(400)
      .json({ error: "Nome, categoria e preço são obrigatórios." });
  }

  const idCategory = parseInt(id_category as string, 10);
  const price = parseFloat(preco.replace(",", ".") as string);
  const isComplementProduct = isComplement === "true" || isComplement === true;

  // Se for um produto complemento, não pode ter grupos de complementos
  if (isComplementProduct && complementsGroupIds) {
    return res.status(400).json({
      error: "Produtos complementos não podem ter grupos de complementos.",
    });
  }

  // Handle complementsGroupIds: ensure it's an array of numbers
  let parsedComplementsGroupIds: number[] = [];
  if (complementsGroupIds && !isComplementProduct) {
    const ids = Array.isArray(complementsGroupIds)
      ? complementsGroupIds
      : [complementsGroupIds];
    parsedComplementsGroupIds = ids
      .map((id: string) => parseInt(id, 10))
      .filter((id: number) => !isNaN(id));
  }

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
      img: img || null, // Imagem opcional
      id_category: idCategory,
      preco: price,
      descricao: descricao ?? "",
      id_tenant: tenant.id,
      isComplement: isComplementProduct,
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
        ...body.data,
        ...(parsedComplementsGroupIds.length > 0 && {
          complements: {
            connect: parsedComplementsGroupIds.map((id: number) => ({ id })),
          },
        }),
      },
      include: {
        complements: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Erro ao criar produto", details: error });
  } finally {
    await prisma.$disconnect();
  }
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
  const {
    nome,
    id_category,
    preco,
    descricao,
    complementsGroupIds,
    isComplement,
  } = req.body;

  console.log("Dados recebidos:", req.body);
  const img = (req.file as any)?.location;
  const productId = parseInt(req.params.productId, 10);
  const tenantSlug = req.params.tenantSlug;
  const isComplementProduct = isComplement === "true" || isComplement === true;

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

    // Se for um produto complemento, não pode ter grupos de complementos
    if (isComplementProduct && complementsGroupIds) {
      return res.status(400).json({
        error: "Produtos complementos não podem ter grupos de complementos.",
      });
    }

    // Prepara os dados para atualização
    const dataToUpdate: any = {};
    if (nome) dataToUpdate.nome = nome;
    if (img) dataToUpdate.img = img;
    if (id_category)
      dataToUpdate.id_category = parseInt(id_category as string, 10);
    if (preco) dataToUpdate.preco = parseFloat(preco.replace(",", "."));
    if (descricao) dataToUpdate.descricao = descricao;
    if (isComplement !== undefined)
      dataToUpdate.isComplement = isComplementProduct;

    // Lógica para atualizar os grupos de complementos
    if (complementsGroupIds !== undefined && !isComplementProduct) {
      // Converter para array se for string única
      const ids = Array.isArray(complementsGroupIds)
        ? complementsGroupIds
        : [complementsGroupIds];

      // Converter para números e filtrar inválidos
      const parsedIds = ids
        .map((id: string) => parseInt(id, 10))
        .filter((id: number) => !isNaN(id));

      console.log("IDs dos grupos de complementos:", parsedIds);

      // Atualizar os grupos de complementos
      dataToUpdate.complements = {
        set: parsedIds.map((id: number) => ({ id })),
      };
    }

    // Validar os dados com o schema
    const body = updateProductSchema.safeParse(dataToUpdate);
    if (!body.success) {
      return res
        .status(400)
        .json({ error: "Dados inválidos", details: body.error.issues });
    }

    // Atualizar o produto no banco de dados
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...body.data,
        complements: dataToUpdate.complements, // Incluir a atualização dos complementos
      },
      include: {
        complements: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
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
