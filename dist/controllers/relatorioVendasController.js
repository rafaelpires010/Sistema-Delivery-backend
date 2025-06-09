"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVendasByData = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllVendasByData = async (req, res) => {
    try {
        const { tenantSlug } = req.params;
        const { dataInicial, dataFinal, formasPagamento, status } = req.query;
        console.log("Parâmetros recebidos:", {
            tenantSlug,
            dataInicial,
            dataFinal,
            formasPagamento,
            status,
        });
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado" });
        }
        // Prepara o filtro de datas
        const dateFilter = {};
        if (dataInicial) {
            // Define início do dia (considerando fuso BR)
            const startDate = new Date(dataInicial + "T00:00:00-03:00");
            dateFilter.gte = startDate;
        }
        if (dataFinal) {
            // Define fim do dia (considerando fuso BR)
            const endDate = new Date(dataFinal + "T23:59:59-03:00");
            dateFilter.lte = endDate;
        }
        // Debug das datas
        console.log("Datas convertidas:", {
            inicio: dateFilter.gte,
            fim: dateFilter.lte,
        });
        // Prepara o filtro de formas de pagamento
        const formasPagamentoIds = formasPagamento
            ? formasPagamento.split(",").map(Number)
            : undefined;
        // Prepara o filtro de status
        const statusList = status ? status.split(",") : undefined;
        // Monta o where com os filtros
        const where = {
            tenantId: tenant.id,
            ...(Object.keys(dateFilter).length > 0 && { data: dateFilter }),
            ...(formasPagamentoIds && {
                formaPagamentoId: {
                    in: formasPagamentoIds,
                },
            }),
            ...(statusList && {
                status: {
                    in: statusList,
                },
            }),
        };
        console.log("Filtros aplicados:", where);
        const vendas = await prisma.venda.findMany({
            where,
            include: {
                formaPagamento: true,
                tenant: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
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
            },
            orderBy: {
                data: "desc",
            },
        });
        console.log(`Vendas encontradas: ${vendas.length}`);
        // Calcula totais
        const totais = {
            quantidade: vendas.length,
            valorTotal: vendas.reduce((acc, venda) => acc + venda.valor, 0),
            porFormaPagamento: vendas.reduce((acc, venda) => {
                const formaPagamento = venda.formaPagamento.nome;
                if (!acc[formaPagamento]) {
                    acc[formaPagamento] = {
                        quantidade: 0,
                        valor: 0,
                    };
                }
                acc[formaPagamento].quantidade += 1;
                acc[formaPagamento].valor += venda.valor;
                return acc;
            }, {}),
            porStatus: vendas.reduce((acc, venda) => {
                const status = venda.status;
                if (!acc[status]) {
                    acc[status] = {
                        quantidade: 0,
                        valor: 0,
                    };
                }
                acc[status].quantidade += 1;
                acc[status].valor += venda.valor;
                return acc;
            }, {}),
        };
        return res.status(200).json({
            success: true,
            data: vendas,
            totais,
            debug: { where },
        });
    }
    catch (error) {
        console.error("Erro ao buscar vendas:", error);
        return res.status(500).json({
            error: "Erro ao buscar vendas",
            details: error,
        });
    }
};
exports.getAllVendasByData = getAllVendasByData;
