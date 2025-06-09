import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função para buscar os valores de faturamento de um usuário
export const getValorFaturamento = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Supondo que o ID do usuário venha como parâmetro na rota

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário não fornecido." });
    }

    const valoresFaturamento = await prisma.valoresFaturamento.findUnique({
      where: {
        userId: parseInt(userId, 10),
      },
    });

    if (!valoresFaturamento) {
      return res
        .status(404)
        .json({ message: "Valores de faturamento não encontrados." });
    }

    res.json(valoresFaturamento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar valores de faturamento." });
  }
};

// Função para editar os valores de faturamento
export const editValorFaturamento = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params; // Busca pelo ID do usuário
    const { valorMensalidade, valorImplantacao } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário não fornecido." });
    }

    if (!valorMensalidade && !valorImplantacao) {
      return res
        .status(400)
        .json({ message: "Nenhum dado para atualizar foi fornecido." });
    }

    const dataToUpdate: {
      valorMensalidade?: number;
      valorImplantacao?: number;
    } = {};
    if (valorMensalidade) {
      dataToUpdate.valorMensalidade = valorMensalidade;
    }
    if (valorImplantacao) {
      dataToUpdate.valorImplantacao = valorImplantacao;
    }

    const updatedValores = await prisma.valoresFaturamento.update({
      where: {
        userId: parseInt(userId, 10), // Usa o ID do usuário para encontrar o registro
      },
      data: dataToUpdate,
    });

    res.json(updatedValores);
  } catch (error) {
    console.error("Erro ao editar valores de faturamento:", error);
    res.status(500).json({ message: "Erro ao editar valores de faturamento." });
  }
};

export const getFautramentoTotal = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        message: "O ID do usuário e as datas de início e fim são obrigatórios.",
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    end.setHours(23, 59, 59, 999);

    const faturamentoRecords = await prisma.tenantsFaturamento.findMany({
      where: {
        created_at: {
          gte: start,
          lte: end,
        },
      },
      include: {
        tenant: true, // Inclui os dados do tenant associado
      },
    });

    if (faturamentoRecords.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum faturamento encontrado no período." });
    }

    let totalMensalidade = 0;
    let totalImplantacao = 0;

    faturamentoRecords.forEach((record) => {
      totalMensalidade += record.valorMensalidade;
      totalImplantacao += record.valorImplantacao;
    });

    const faturamentoTotal = totalMensalidade + totalImplantacao;

    res.json({
      faturamentoTotal,
      totalMensalidade,
      totalImplantacao,
      faturamentos: faturamentoRecords, // Retorna a lista detalhada
    });
  } catch (error) {
    console.error("Erro ao calcular o faturamento total:", error);
    res.status(500).json({ message: "Erro ao calcular o faturamento total." });
  }
};

export const getMonthlyGrowth = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "O mês e o ano são obrigatórios." });
    }

    const currentMonth = parseInt(month as string, 10);
    const currentYear = parseInt(year as string, 10);

    // Função auxiliar para calcular o faturamento de um mês
    const calculateFaturamento = async (
      targetMonth: number,
      targetYear: number
    ) => {
      const startDate = new Date(targetYear, targetMonth - 1, 1);
      const endDate = new Date(targetYear, targetMonth, 0);
      endDate.setHours(23, 59, 59, 999);

      const result = await prisma.tenantsFaturamento.aggregate({
        where: {
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          valorMensalidade: true,
          valorImplantacao: true,
        },
      });
      const totalMensalidade = result._sum.valorMensalidade || 0;
      const totalImplantacao = result._sum.valorImplantacao || 0;
      return totalMensalidade + totalImplantacao;
    };

    // Calcular faturamento do mês atual
    const faturamentoAtual = await calculateFaturamento(
      currentMonth,
      currentYear
    );

    // Calcular faturamento do mês anterior
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const faturamentoAnterior = await calculateFaturamento(
      previousMonth,
      previousYear
    );

    // Calcular o crescimento percentual
    let crescimentoPercentual = 0;
    if (faturamentoAnterior > 0) {
      crescimentoPercentual =
        ((faturamentoAtual - faturamentoAnterior) / faturamentoAnterior) * 100;
    } else if (faturamentoAtual > 0) {
      crescimentoPercentual = 100; // Crescimento "infinito" se o anterior era 0
    }

    res.json({
      crescimentoPercentual: parseFloat(crescimentoPercentual.toFixed(2)),
    });
  } catch (error) {
    console.error("Erro ao calcular o crescimento mensal:", error);
    res.status(500).json({ message: "Erro ao calcular o crescimento mensal." });
  }
};
