import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRelatorioByData = async (req: Request, res: Response) => {
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
      ...(Object.keys(dateFilter).length > 0 && { dataHora_order: dateFilter }),
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

    console.log("Filtro WHERE para relatório:", JSON.stringify(where, null, 2));

    // Busca todos os pedidos do período
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

    // Busca todos os produtos ativos do tenant
    const produtos = await prisma.product.findMany({
      where: { id_tenant: tenant.id },
      include: { category: true },
    });

    // Busca todas as categorias ativas do tenant
    const categorias = await prisma.category.findMany({
      where: { id_tenant: tenant.id, ativo: true },
    });

    // --- SALES REPORT (por mês) ---
    const salesByMonth = {} as Record<
      string,
      { vendas: number; pedidos: number }
    >;
    vendas.forEach((order) => {
      const date = new Date(order.dataHora_order);
      const month = date.toLocaleString("pt-BR", { month: "short" });
      if (!salesByMonth[month]) salesByMonth[month] = { vendas: 0, pedidos: 0 };
      salesByMonth[month].vendas += order.preco || 0;
      salesByMonth[month].pedidos += 1;
    });
    const salesReport = Object.entries(salesByMonth).map(([period, val]) => ({
      period,
      vendas: val.vendas,
      pedidos: val.pedidos,
    }));

    // --- TOP PRODUCTS ---
    const productStats = new Map();
    vendas.forEach((order) => {
      order.products.forEach((op) => {
        if (!productStats.has(op.product.nome)) {
          productStats.set(op.product.nome, { sales: 0, revenue: 0 });
        }
        const stat = productStats.get(op.product.nome);
        stat.sales += op.quantidade;
        stat.revenue += op.quantidade * op.product.preco;
      });
    });
    const topProducts = Array.from(productStats.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // --- SUMMARY ---
    const faturamentoTotal = vendas.reduce((sum, o) => sum + (o.preco || 0), 0);
    const totalPedidos = vendas.length;
    const produtosVendidos = vendas.reduce(
      (sum, o) => sum + o.products.reduce((s, p) => s + p.quantidade, 0),
      0
    );
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;
    // Crescimento: placeholder (você pode calcular comparando com período anterior)
    const summary = {
      faturamentoTotal,
      faturamentoCrescimento: 0,
      totalPedidos,
      pedidosCrescimento: 0,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      ticketMedioCrescimento: 0,
      produtosVendidos,
      produtosVendidosCrescimento: 0,
    };

    // --- PRODUCTS REPORT (produtos e categorias por mês) ---
    const productsByMonth = {} as Record<
      string,
      { produtos: Set<number>; categorias: Set<number> }
    >;
    vendas.forEach((order) => {
      const date = new Date(order.dataHora_order);
      const month = date.toLocaleString("pt-BR", { month: "short" });
      if (!productsByMonth[month])
        productsByMonth[month] = { produtos: new Set(), categorias: new Set() };
      order.products.forEach((op) => {
        productsByMonth[month].produtos.add(op.product.id);
        productsByMonth[month].categorias.add(op.product.id_category);
      });
    });
    const productsReport = Object.entries(productsByMonth).map(
      ([period, val]) => ({
        period,
        produtos: val.produtos.size,
        categorias: val.categorias.size,
      })
    );

    // --- CATEGORY DISTRIBUTION ---
    const categoryStats = new Map();
    vendas.forEach((order) => {
      order.products.forEach((op) => {
        const cat = op.product.category;
        if (!categoryStats.has(cat.nome)) {
          categoryStats.set(cat.nome, { value: 0 });
        }
        categoryStats.get(cat.nome).value += op.quantidade;
      });
    });
    // Cores fixas para exemplo
    const categoryColors = [
      "#7134a3",
      "#9976d0",
      "#b8a9d9",
      "#d4c7e7",
      "#e8e0f0",
    ];
    const categoryDistribution = Array.from(categoryStats.entries()).map(
      ([name, stat], idx) => ({
        name,
        value: stat.value,
        color: categoryColors[idx % categoryColors.length],
      })
    );

    // --- TOP CATEGORIES ---
    const topCategoriesStats = new Map();
    vendas.forEach((order) => {
      order.products.forEach((op) => {
        const cat = op.product.category;
        if (!topCategoriesStats.has(cat.nome)) {
          topCategoriesStats.set(cat.nome, {
            produtos: new Set(),
            vendas: 0,
            faturamento: 0,
          });
        }
        const stat = topCategoriesStats.get(cat.nome);
        stat.produtos.add(op.product.id);
        stat.vendas += op.quantidade;
        stat.faturamento += op.quantidade * op.product.preco;
      });
    });
    const topCategories = Array.from(topCategoriesStats.entries())
      .map(([name, stat]) => ({
        name,
        produtos: stat.produtos.size,
        vendas: stat.vendas,
        faturamento: Number(stat.faturamento.toFixed(2)),
      }))
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5);

    // --- PRODUCTS SUMMARY ---
    const totalProdutos = produtos.length;
    const produtosEstoque = produtos.filter((p) => p.ativo).length;
    const produtosInativos = produtos.filter((p) => !p.ativo).length;
    const categoriasAtivas = categorias.length;
    const productsSummary = {
      totalProdutos,
      produtosCrescimento: 0,
      categoriasAtivas,
      categoriasCrescimento: 0,
      produtosEstoque,
      produtosEstoquePercentual:
        totalProdutos > 0
          ? Number(((produtosEstoque / totalProdutos) * 100).toFixed(1))
          : 0,
      produtosInativos,
      produtosInativosPercentual:
        totalProdutos > 0
          ? Number(((produtosInativos / totalProdutos) * 100).toFixed(1))
          : 0,
    };

    return res.status(200).json({
      salesReport,
      topProducts,
      summary,
      productsReport,
      categoryDistribution,
      topCategories,
      productsSummary,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório de produtos:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return res.status(500).json({
      error: "Erro ao gerar relatório de produtos",
      details: error,
    });
  }
};

export const getResumoRelatorio = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { dataInicial, dataFinal } = req.query;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Filtro de datas
    const dateFilter: any = {};
    if (dataInicial) {
      const startDate = new Date((dataInicial as string) + "T00:00:00-03:00");
      dateFilter.gte = startDate;
    }
    if (dataFinal) {
      const endDate = new Date((dataFinal as string) + "T23:59:59-03:00");
      dateFilter.lte = endDate;
    }

    const where = {
      id_tenant: tenant.id,
      ...(Object.keys(dateFilter).length > 0 && { dataHora_order: dateFilter }),
    };

    // Busca todos os pedidos do período
    const vendas = await prisma.order.findMany({
      where,
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    // --- SALES REPORT (por mês) ---
    const salesByMonth = {} as Record<
      string,
      { vendas: number; pedidos: number }
    >;
    vendas.forEach((order) => {
      const date = new Date(order.dataHora_order);
      const month = date.toLocaleString("pt-BR", { month: "short" });
      if (!salesByMonth[month]) salesByMonth[month] = { vendas: 0, pedidos: 0 };
      salesByMonth[month].vendas += order.preco || 0;
      salesByMonth[month].pedidos += 1;
    });
    const salesReport = Object.entries(salesByMonth).map(([period, val]) => ({
      period,
      vendas: val.vendas,
      pedidos: val.pedidos,
    }));

    // --- TOP PRODUCTS ---
    const productStats = new Map();
    vendas.forEach((order) => {
      order.products.forEach((op) => {
        if (!productStats.has(op.product.nome)) {
          productStats.set(op.product.nome, { sales: 0, revenue: 0 });
        }
        const stat = productStats.get(op.product.nome);
        stat.sales += op.quantidade;
        stat.revenue += op.quantidade * op.product.preco;
      });
    });
    const topProducts = Array.from(productStats.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // --- SUMMARY ---
    const faturamentoTotal = vendas.reduce((sum, o) => sum + (o.preco || 0), 0);
    const totalPedidos = vendas.length;
    const produtosVendidos = vendas.reduce(
      (sum, o) => sum + o.products.reduce((s, p) => s + p.quantidade, 0),
      0
    );
    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0;
    // Crescimento: placeholder (você pode calcular comparando com período anterior)
    const summary = {
      faturamentoTotal,
      faturamentoCrescimento: 0,
      totalPedidos,
      pedidosCrescimento: 0,
      ticketMedio: Number(ticketMedio.toFixed(2)),
      ticketMedioCrescimento: 0,
      produtosVendidos,
      produtosVendidosCrescimento: 0,
    };

    return res.status(200).json({
      summary,
      salesReport,
      topProducts,
    });
  } catch (error) {
    console.error("Erro ao gerar resumo do relatório:", error);
    return res.status(500).json({
      error: "Erro ao gerar resumo do relatório",
      details: error,
    });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Total de pedidos
    const totalPedidos = await prisma.order.count({
      where: { id_tenant: tenant.id },
    });
    // Produtos ativos
    const produtosAtivos = await prisma.product.count({
      where: { id_tenant: tenant.id, ativo: true },
    });
    // Usuários cadastrados
    const usuariosCadastrados = await prisma.user.count();
    // Faturamento do mês atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );
    const faturamentoMensal = await prisma.order.aggregate({
      where: {
        id_tenant: tenant.id,
        dataHora_order: { gte: firstDay, lte: lastDay },
      },
      _sum: { preco: true },
    });

    // Vendas por dia da semana (Seg, Ter, ...)
    const salesDataMap = {
      Seg: 0,
      Ter: 0,
      Qua: 0,
      Qui: 0,
      Sex: 0,
      Sáb: 0,
      Dom: 0,
    };
    const ordersThisWeek = await prisma.order.findMany({
      where: {
        id_tenant: tenant.id,
        dataHora_order: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6),
        },
      },
      select: { dataHora_order: true, preco: true },
    });
    ordersThisWeek.forEach((order) => {
      const day = new Date(order.dataHora_order).toLocaleString("pt-BR", {
        weekday: "short",
      });
      // Ajusta para o formato Seg, Ter, ...
      const mapDay = (day.charAt(0).toUpperCase() +
        day.slice(1, 3)) as keyof typeof salesDataMap;
      if (salesDataMap[mapDay] !== undefined) {
        salesDataMap[mapDay] += order.preco || 0;
      }
    });
    const salesData = Object.entries(salesDataMap).map(([name, vendas]) => ({
      name,
      vendas,
    }));

    // Status dos pedidos
    const statusColors = {
      delivered: "#10b981",
      preparing: "#3b82f6",
      pending: "#f59e0b",
      cancelled: "#ef4444",
      cancelado: "#ef4444",
      em_preparo: "#3b82f6",
      entregue: "#10b981",
      pendente: "#f59e0b",
    };
    const statusMap = {
      Entregues: ["delivered", "entregue"],
      "Em preparo": ["preparing", "em_preparo"],
      Pendentes: ["pending", "pendente"],
      Cancelados: ["cancelled", "cancelado"],
    };
    const orderStatusData = await Promise.all(
      Object.entries(statusMap).map(async ([name, statusArr]) => {
        const value = await prisma.order.count({
          where: {
            id_tenant: tenant.id,
            status: { in: statusArr },
          },
        });
        return {
          name,
          value,
          color: statusColors[statusArr[0] as keyof typeof statusColors],
        };
      })
    );

    // Recentes 5 pedidos
    const recentOrdersRaw = await prisma.order.findMany({
      where: { id_tenant: tenant.id },
      orderBy: { dataHora_order: "desc" },
      take: 5,
      include: {
        user: true,
        order_user: true,
      },
    });
    const recentOrders = recentOrdersRaw.map((order, idx) => {
      const customer = order.user?.nome || order.order_user?.nome || "-";
      const total = order.preco
        ? `R$ ${order.preco.toFixed(2).replace(".", ",")}`
        : "-";
      // Status padronizado
      let status = order.status;
      if (["entregue", "delivered"].includes(status)) status = "delivered";
      else if (["em_preparo", "preparing"].includes(status))
        status = "preparing";
      else if (["pendente", "pending"].includes(status)) status = "pending";
      else if (["cancelado", "cancelled"].includes(status))
        status = "cancelled";
      // Tempo relativo (exemplo simples)
      const diffMs = Date.now() - new Date(order.dataHora_order).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let time = diffMin <= 0 ? "agora" : `${diffMin} min atrás`;
      return {
        id: `#${String(order.id).padStart(3, "0")}`,
        customer,
        total,
        status,
        time,
      };
    });

    return res.status(200).json({
      dashboardData: {
        totalPedidos,
        produtosAtivos,
        usuariosCadastrados,
        faturamentoMensal: Number(
          (faturamentoMensal._sum.preco || 0).toFixed(2)
        ),
      },
      salesData,
      orderStatusData,
      recentOrders,
    });
  } catch (error) {
    console.error("Erro ao gerar dashboard:", error);
    return res
      .status(500)
      .json({ error: "Erro ao gerar dashboard", details: error });
  }
};
