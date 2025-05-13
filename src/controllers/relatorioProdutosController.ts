import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllProdutosByData = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { dataInicial, dataFinal, categoriaId, produtoId } = req.query;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Prepara o filtro de datas
    const dateFilter: any = {};
    if (dataInicial) {
      const startDate = new Date((dataInicial as string) + "T00:00:00-03:00");
      dateFilter.gte = startDate;
    }
    if (dataFinal) {
      const endDate = new Date((dataFinal as string) + "T23:59:59-03:00");
      dateFilter.lte = endDate;
    }

    // Prepara os arrays de IDs
    const categoriaIds = categoriaId
      ? (categoriaId as string).split(",").map(Number)
      : undefined;

    const produtoIds = produtoId
      ? (produtoId as string).split(",").map(Number)
      : undefined;

    // Monta a query base
    const where = {
      id_tenant: tenant.id,
      ...(Object.keys(dateFilter).length > 0 && { data_order: dateFilter }),
      ...(categoriaIds && {
        products: {
          some: {
            product: {
              id_category: {
                in: categoriaIds,
              },
            },
          },
        },
      }),
      ...(produtoIds && {
        products: {
          some: {
            product: {
              id: {
                in: produtoIds,
              },
            },
          },
        },
      }),
    };

    const vendas = await prisma.order.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        venda: true,
      },
    });

    const produtosMap = new Map();

    vendas.forEach((order) => {
      order.products.forEach((orderProduct) => {
        const { product } = orderProduct;
        const status = order.venda?.status || null;

        if (!produtosMap.has(product.id)) {
          produtosMap.set(product.id, {
            id: product.id,
            nome: product.nome,
            categoria: {
              nome: product.category.nome,
            },
            quantidade_vendida: 0,
            quantidade_cancelada: 0,
            preco_venda: product.preco,
            valor_total_vendas: 0,
            imagem: product.img,
          });
        }

        const produtoStats = produtosMap.get(product.id);

        if (status === "CANCELADA") {
          produtoStats.quantidade_cancelada += orderProduct.quantidade;
        } else {
          produtoStats.quantidade_vendida += orderProduct.quantidade;
          produtoStats.valor_total_vendas +=
            orderProduct.quantidade * orderProduct.product.preco;
        }
      });
    });

    const relatorioProdutos = Array.from(produtosMap.values());

    return res.status(200).json({
      success: true,
      data: relatorioProdutos,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de produtos:", error);
    return res.status(500).json({
      error: "Erro ao gerar relatório de produtos",
      details: error,
    });
  }
};
