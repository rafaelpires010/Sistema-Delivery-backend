import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllFormasPagamentoDelivery = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantSlug } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    const formasPagamento = await prisma.formasPagamento.findMany({
      where: {
        tenantId: tenant.id,
        ativo: true,
        delivery: true,
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        aceitaTroco: true,
        ativo: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: formasPagamento,
    });
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao buscar formas de pagamento",
      details: error,
    });
  }
};

export const getAllFormasPagamento = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    const formasPagamento = await prisma.formasPagamento.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: {
        nome: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      data: formasPagamento,
    });
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao buscar formas de pagamento",
      details: error,
    });
  }
};

export const criarNovaFormaPagamento = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { nome, tipo, aceitaTroco, delivery = true, ativo = true } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Validações básicas
    if (!nome || !tipo) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "Nome e tipo são obrigatórios",
      });
    }

    const novaFormaPagamento = await prisma.formasPagamento.create({
      data: {
        nome,
        tipo,
        aceitaTroco: aceitaTroco || false,
        delivery: delivery || false,
        ativo,
        tenant: {
          connect: {
            id: tenant.id,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: novaFormaPagamento.id,
        nome: novaFormaPagamento.nome,
        tipo: novaFormaPagamento.tipo,
        aceitaTroco: novaFormaPagamento.aceitaTroco,
        delivery: novaFormaPagamento.delivery,
        ativo: novaFormaPagamento.ativo,
      },
    });
  } catch (error) {
    console.error("Erro ao criar forma de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao criar forma de pagamento",
      details: error,
    });
  }
};

export const editarFormaPagamento = async (req: Request, res: Response) => {
  try {
    const { tenantSlug, formaPagamentoId } = req.params;
    const { nome, tipo, aceitaTroco, delivery = true, ativo } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se a forma de pagamento existe e pertence ao tenant
    const formaPagamentoExistente = await prisma.formasPagamento.findFirst({
      where: {
        id: Number(formaPagamentoId),
        tenantId: tenant.id,
      },
    });

    if (!formaPagamentoExistente) {
      return res
        .status(404)
        .json({ error: "Forma de pagamento não encontrada" });
    }

    // Validações básicas
    if (!nome || !tipo) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "Nome e tipo são obrigatórios",
      });
    }

    const formaPagamentoAtualizada = await prisma.formasPagamento.update({
      where: {
        id: Number(formaPagamentoId),
      },
      data: {
        nome,
        tipo,
        aceitaTroco,
        delivery,
        ativo,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        id: formaPagamentoAtualizada.id,
        nome: formaPagamentoAtualizada.nome,
        tipo: formaPagamentoAtualizada.tipo,
        aceitaTroco: formaPagamentoAtualizada.aceitaTroco,
        delivery: formaPagamentoAtualizada.delivery,
        ativo: formaPagamentoAtualizada.ativo,
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar forma de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao atualizar forma de pagamento",
      details: error,
    });
  }
};

export const deletarFormaPagamento = async (req: Request, res: Response) => {
  try {
    const { tenantSlug, formaPagamentoId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se a forma de pagamento existe e pertence ao tenant
    const formaPagamento = await prisma.formasPagamento.findFirst({
      where: {
        id: Number(formaPagamentoId),
        tenantId: tenant.id,
      },
      include: {
        vendas: true,
        orders: true,
      },
    });

    if (!formaPagamento) {
      return res
        .status(404)
        .json({ error: "Forma de pagamento não encontrada" });
    }

    // Verifica se existem vendas ou pedidos usando esta forma de pagamento
    if (formaPagamento.vendas.length > 0 || formaPagamento.orders.length > 0) {
      // Em vez de deletar, apenas desativa
      const formaPagamentoDesativada = await prisma.formasPagamento.update({
        where: {
          id: Number(formaPagamentoId),
        },
        data: {
          ativo: false,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Forma de pagamento desativada com sucesso",
        data: formaPagamentoDesativada,
      });
    }

    // Se não houver vendas ou pedidos, deleta completamente
    await prisma.formasPagamento.delete({
      where: {
        id: Number(formaPagamentoId),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Forma de pagamento deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar forma de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao deletar forma de pagamento",
      details: error,
    });
  }
};

export const toggleFormaPagamentoStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantSlug, formaPagamentoId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se a forma de pagamento existe e pertence ao tenant
    const formaPagamento = await prisma.formasPagamento.findFirst({
      where: {
        id: Number(formaPagamentoId),
        tenantId: tenant.id,
      },
    });

    if (!formaPagamento) {
      return res
        .status(404)
        .json({ error: "Forma de pagamento não encontrada" });
    }

    // Alterna o status
    const formaPagamentoAtualizada = await prisma.formasPagamento.update({
      where: {
        id: Number(formaPagamentoId),
      },
      data: {
        ativo: !formaPagamento.ativo,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Forma de pagamento ${
        formaPagamentoAtualizada.ativo ? "ativada" : "desativada"
      } com sucesso`,
      data: formaPagamentoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao alterar status da forma de pagamento:", error);
    return res.status(500).json({
      error: "Erro ao alterar status da forma de pagamento",
      details: error,
    });
  }
};
