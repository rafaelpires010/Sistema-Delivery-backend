import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const createVenda = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { orderId, valor, formaPagamentoId, pdvId, operadorId } = req.body;

    // Busca o userTenant do operador
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!userTenant) {
      return res.status(403).json({ error: "Usuário sem acesso ao tenant" });
    }

    // Verifica se o pedido existe e pertence ao tenant
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Se for venda PDV, verifica se o PDV está aberto
    if (pdvId) {
      const pdv = await prisma.pdvFrenteDeCaixa.findFirst({
        where: {
          id: pdvId,
          status: "ABERTO",
          userTenantId: userTenant.id,
        },
      });

      if (!pdv) {
        return res.status(400).json({
          error: "PDV não encontrado ou não está aberto para este operador",
        });
      }
    }

    // Verifica se a forma de pagamento existe e pertence ao tenant
    const formaPagamento = await prisma.formasPagamento.findFirst({
      where: {
        id: formaPagamentoId,
        tenantId: order.id_tenant,
        ativo: true,
      },
    });

    if (!formaPagamento) {
      return res.status(400).json({
        error: "Forma de pagamento não encontrada ou inativa",
      });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // Gera o número da venda
      const ultimaVenda = await prisma.venda.findFirst({
        where: { tenantId: order.id_tenant },
        orderBy: { id: "desc" },
      });
      const ultimoNumero = ultimaVenda ? parseInt(ultimaVenda.nrVenda) : 0;
      const nrVenda = (ultimoNumero + 1).toString().padStart(5, "0");

      const venda = await prisma.venda.create({
        data: {
          nrVenda: nrVenda,
          tenant: {
            connect: { id: order.id_tenant },
          },
          valor,
          status: "PENDENTE",
          formaPagamento: {
            connect: { id: formaPagamento.id },
          },
          frenteCaixa: pdvId
            ? {
                connect: { id: pdvId },
              }
            : undefined,
          operador: operadorId
            ? {
                connect: { id: operadorId },
              }
            : undefined,
          order: {
            connect: { id: orderId },
          },
        },
        include: {
          order: true,
          formaPagamento: true,
        },
      });

      return venda;
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar venda:", error);
    return res.status(500).json({
      error: "Erro ao criar venda",
      details: error,
    });
  }
};

export const alteraStatusVenda = async (req: Request, res: Response) => {
  try {
    const { tenantSlug, vendaId } = req.params;
    const { status } = req.body;

    // Verifica se o status é válido
    const statusValidos = ["PENDENTE", "APROVADA", "CANCELADA", "ESTORNADA"];
    if (!statusValidos.includes(status)) {
      return res.status(400).json({
        error: "Status inválido",
        statusPermitidos: statusValidos,
      });
    }

    // Verifica se a venda existe e pertence ao tenant
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(vendaId),
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    // Atualiza o status da venda
    const vendaAtualizada = await prisma.venda.update({
      where: {
        id: Number(vendaId),
      },
      data: {
        status,
      },
      include: {
        order: {
          include: {
            products: true,
            user: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        operador: {
          select: {
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
        frenteCaixa: {
          select: {
            pdv: true,
          },
        },
        formaPagamento: true,
        tenant: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao alterar status da venda:", error);
    return res.status(500).json({
      error: "Erro ao alterar status da venda",
      details: error,
    });
  }
};

export const confirmaVenda = async (req: Request, res: Response) => {
  try {
    const { tenantSlug, orderId } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    // Busca o userTenant do operador
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        userId: decoded.id,
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!userTenant) {
      return res.status(403).json({ error: "Usuário sem acesso ao tenant" });
    }

    // Verifica se a venda existe e pertence ao tenant
    const venda = await prisma.venda.findFirst({
      where: {
        orderId: Number(orderId),
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    // Atualiza o status da venda e o operador
    const vendaAtualizada = await prisma.venda.update({
      where: {
        orderId: Number(orderId),
      },
      data: {
        status: "ACEITO",
        operadorId: userTenant.id,
      },
      include: {
        order: {
          include: {
            products: true,
            user: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        operador: {
          select: {
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
        frenteCaixa: {
          select: {
            pdv: true,
          },
        },
        formaPagamento: true,
        tenant: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao confirmar venda:", error);
    return res.status(500).json({
      error: "Erro ao confirmar venda",
      details: error,
    });
  }
};

export const cancelarVenda = async (req: Request, res: Response) => {
  try {
    const { tenantSlug, id } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    // Busca o userTenant do operador
    const userTenant = await prisma.userTenant.findFirst({
      where: {
        userId: decoded.id,
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!userTenant) {
      return res.status(403).json({ error: "Usuário sem acesso ao tenant" });
    }

    // Verifica se a venda existe e pertence ao tenant
    const venda = await prisma.venda.findFirst({
      where: {
        id: Number(id),
        tenant: {
          slug: tenantSlug,
        },
      },
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
      });
    }

    // Verifica se a venda já está cancelada
    if (venda.status === "CANCELADA") {
      return res.status(400).json({
        error: "Venda já está cancelada",
      });
    }

    // Atualiza o status da venda para CANCELADA
    const vendaAtualizada = await prisma.venda.update({
      where: {
        id: Number(id),
      },
      data: {
        status: "CANCELADA",
        operadorId: userTenant.id,
      },
      include: {
        order: {
          include: {
            products: true,
            user: {
              select: {
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
        operador: {
          select: {
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
        frenteCaixa: {
          select: {
            pdv: true,
          },
        },
        formaPagamento: true,
        tenant: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);
    return res.status(500).json({
      error: "Erro ao cancelar venda",
      details: error,
    });
  }
};
