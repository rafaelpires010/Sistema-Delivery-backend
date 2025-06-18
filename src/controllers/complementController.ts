import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { RequestHandler } from "express";

const prisma = new PrismaClient();

// Vincular produtos complementos a um grupo
export const linkComplementToGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { complementsId, productIds } = req.body;
  const tenantSlug = req.params.tenantSlug;

  console.log("Dados recebidos:", { complementsId, productIds, tenantSlug });

  if (
    !complementsId ||
    !productIds ||
    !Array.isArray(productIds) ||
    productIds.length === 0
  ) {
    return res.status(400).json({
      error:
        "ID do grupo de complementos e array de IDs dos produtos são obrigatórios",
    });
  }

  try {
    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    console.log("Tenant encontrado:", tenant.id);

    // Verificar se o grupo de complementos existe
    const complementGroup = await prisma.complements.findFirst({
      where: {
        id: parseInt(complementsId),
        id_tenant: tenant.id,
      },
    });

    console.log("Grupo de complementos encontrado:", complementGroup);

    if (!complementGroup) {
      return res
        .status(404)
        .json({ error: "Grupo de complementos não encontrado" });
    }

    // Verificar se todos os produtos existem
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds.map((id) => parseInt(id)),
        },
        id_tenant: tenant.id,
      },
    });

    console.log("Produtos encontrados:", products);

    if (products.length !== productIds.length) {
      return res.status(404).json({
        error: "Um ou mais produtos não foram encontrados",
        details: {
          produtosEncontrados: products.length,
          produtosSolicitados: productIds.length,
        },
      });
    }

    // Verificar quais produtos já estão vinculados
    const existingLinks = await prisma.complement.findMany({
      where: {
        complementsId: parseInt(complementsId),
        productId: {
          in: productIds.map((id) => parseInt(id)),
        },
      },
    });

    console.log("Vínculos existentes:", existingLinks);

    // Filtrar produtos que ainda não estão vinculados
    const newProductIds = productIds.filter(
      (productId) =>
        !existingLinks.some((link) => link.productId === parseInt(productId))
    );

    if (newProductIds.length === 0) {
      return res.status(400).json({
        error: "Todos os produtos já estão vinculados a este grupo",
      });
    }

    // Vincular os produtos ao grupo
    const complementItems = await Promise.all(
      newProductIds.map((productId) =>
        prisma.complement.create({
          data: {
            complementsId: parseInt(complementsId),
            productId: parseInt(productId),
          },
          include: {
            product: true,
          },
        })
      )
    );

    console.log("Vínculos criados:", complementItems);

    res.status(201).json({
      message: "Produtos vinculados ao grupo com sucesso",
      data: {
        vinculados: complementItems,
        jaVinculados: existingLinks.map((link) => link.productId),
      },
    });
  } catch (error) {
    console.error("Erro ao vincular produtos ao grupo:", error);
    res.status(500).json({ error: "Erro ao vincular produtos ao grupo" });
  } finally {
    await prisma.$disconnect();
  }
};

// Desvincular produto complemento de um grupo
export const unlinkComplementFromGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { complementsId, productId } = req.params;
  const tenantSlug = req.params.tenantSlug;

  try {
    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verificar se o vínculo existe
    const complementItem = await prisma.complement.findFirst({
      where: {
        complementsId: parseInt(complementsId),
        productId: parseInt(productId),
        complements: {
          id_tenant: tenant.id,
        },
      },
    });

    if (!complementItem) {
      return res.status(404).json({
        error: "Vínculo entre produto e grupo não encontrado",
      });
    }

    // Remover o vínculo
    await prisma.complement.delete({
      where: {
        id: complementItem.id,
      },
    });

    res.status(200).json({
      message: "Produto desvinculado do grupo com sucesso",
    });
  } catch (error) {
    console.error("Erro ao desvincular produto do grupo:", error);
    res.status(500).json({ error: "Erro ao desvincular produto do grupo" });
  } finally {
    await prisma.$disconnect();
  }
};

// Listar produtos vinculados a um grupo
export const getLinkedProducts: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { complementsId } = req.params;
  const tenantSlug = req.params.tenantSlug;

  try {
    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Buscar os produtos vinculados ao grupo
    const linkedProducts = await prisma.complement.findMany({
      where: {
        complementsId: parseInt(complementsId),
        complements: {
          id_tenant: tenant.id,
        },
      },
      include: {
        product: true,
      },
    });

    res.status(200).json(linkedProducts);
  } catch (error) {
    console.error("Erro ao listar produtos vinculados:", error);
    res.status(500).json({ error: "Erro ao listar produtos vinculados" });
  } finally {
    await prisma.$disconnect();
  }
};
