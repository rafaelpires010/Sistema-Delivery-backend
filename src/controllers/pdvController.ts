import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Criar um novo PDV
export const createPdv = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdv } = req.body; // Mudado de 'nome' para 'pdv' para corresponder ao schema

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se já existe um PDV com este nome
    const pdvExistente = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        tenantId: tenant.id,
        pdv: pdv, // Atualizado para usar 'pdv'
      },
    });

    if (pdvExistente) {
      return res.status(400).json({ error: "PDV já existe" });
    }

    // Verifica limite de PDVs
    const pdvsAtivos = await prisma.pdvFrenteDeCaixa.count({
      where: {
        tenantId: tenant.id,
      },
    });

    if (pdvsAtivos >= tenant.limite_pdvs) {
      return res.status(400).json({
        error: `Limite de ${tenant.limite_pdvs} PDVs atingido`,
      });
    }

    // Cria o novo PDV
    const novoPdv = await prisma.pdvFrenteDeCaixa.create({
      data: {
        tenantId: tenant.id,
        pdv: pdv, // Atualizado para usar 'pdv'
        status: "FECHADO",
      },
    });

    return res.status(201).json(novoPdv);
  } catch (error) {
    console.error("Erro ao criar PDV:", error);
    return res.status(500).json({ error: "Erro ao criar PDV" });
  }
};

// Abrir um caixa
export const abrirCaixa = async (req: Request, res: Response) => {
  try {
    const { pdvId, valorInicial } = req.body;
    const { tenantSlug } = req.params;
    const operador = res.locals.operador;

    if (!operador) {
      return res.status(401).json({ error: "Operador não autenticado" });
    }

    // Verifica se existe uma operação de abertura sem fechamento
    const ultimaOperacao = await prisma.pdvCaixaOperacao.findFirst({
      where: {
        frenteCaixaId: Number(pdvId),
        tipo: "ABERTURA",
        dataFechamento: null,
        dataAbertura: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)), // Apenas do dia anterior para frente
        },
      },
      orderBy: {
        dataAbertura: "desc",
      },
    });

    if (ultimaOperacao && ultimaOperacao.dataAbertura) {
      const dataAbertura = new Date(ultimaOperacao.dataAbertura);
      const hoje = new Date();

      // Se for do mesmo dia
      if (
        dataAbertura.getDate() === hoje.getDate() &&
        dataAbertura.getMonth() === hoje.getMonth() &&
        dataAbertura.getFullYear() === hoje.getFullYear()
      ) {
        return res.status(400).json({
          error: "Caixa já está aberto",
          message: "O caixa já foi aberto hoje e ainda não foi fechado",
          dataAbertura: dataAbertura,
        });
      }

      // Se for do dia anterior
      return res.status(400).json({
        error: "Caixa com fechamento pendente",
        message:
          "Existe um caixa aberto do dia anterior que precisa ser fechado",
        dataAbertura: dataAbertura,
      });
    }

    // Verifica se o PDV existe e está fechado
    const pdvExiste = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        id: Number(pdvId),
        tenantId: operador.tenantId,
        status: "FECHADO",
      },
    });

    if (!pdvExiste) {
      return res.status(404).json({
        error: "PDV não encontrado ou não está disponível para abertura",
      });
    }

    const pdv = await prisma.$transaction(async (prisma) => {
      const pdvAtualizado = await prisma.pdvFrenteDeCaixa.update({
        where: {
          id: Number(pdvId),
        },
        data: {
          status: "ABERTO",
          userTenantId: operador.id,
        },
      });

      await prisma.pdvCaixaOperacao.create({
        data: {
          frenteCaixaId: Number(pdvId),
          operadorId: operador.id,
          tipo: "ABERTURA",
          valorInicial: Number(valorInicial),
          dataAbertura: new Date(),
        },
      });

      return pdvAtualizado;
    });

    return res.status(200).json({
      success: true,
      message: "Caixa aberto com sucesso",
      data: pdv,
    });
  } catch (error) {
    console.error("Erro ao abrir caixa:", error);
    return res.status(500).json({ error: "Erro ao abrir caixa" });
  }
};

// Fechar um caixa
export const fecharCaixa = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha, observacao } = req.body;

    if (!pdvId || !operadorId || !operadorSenha) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador e senha são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Busca a abertura do caixa
    const aberturaCaixa = await prisma.pdvCaixaOperacao.findFirst({
      where: {
        frenteCaixaId: pdvId,
        tipo: "ABERTURA",
        dataFechamento: null,
      },
      orderBy: {
        dataAbertura: "desc",
      },
    });

    if (!aberturaCaixa) {
      return res.status(400).json({
        error: "Caixa não encontrado ou já fechado",
        message:
          "Para realizar operações, é necessário abrir o caixa novamente",
      });
    }

    if (aberturaCaixa && aberturaCaixa.dataAbertura) {
      // Verifica se a abertura é de um dia anterior
      const dataAbertura = new Date(aberturaCaixa.dataAbertura);
      const hoje = new Date();

      if (
        dataAbertura.getDate() < hoje.getDate() ||
        dataAbertura.getMonth() < hoje.getMonth() ||
        dataAbertura.getFullYear() < hoje.getFullYear()
      ) {
        return res.status(400).json({
          error: "Caixa com fechamento pendente",
          message:
            "O caixa foi aberto em um dia anterior e precisa ser fechado. Após o fechamento, abra o caixa novamente.",
          dataAbertura: dataAbertura,
        });
      }
    }

    // Verifica se o PDV está realmente aberto
    const pdvAberto = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        id: pdvId,
        status: "ABERTO",
        userTenantId: operador.id,
      },
    });

    if (!pdvAberto) {
      return res.status(400).json({
        error: "PDV não está aberto",
        message: "O PDV precisa estar aberto e associado ao operador atual",
      });
    }

    // Calcula o valor total das vendas
    const vendas = await prisma.venda.findMany({
      where: {
        frenteCaixaId: pdvId,
        status: "ACEITO",
        data: {
          gte: aberturaCaixa.dataAbertura!,
        },
      },
      include: {
        order: {
          include: {
            products: true,
          },
        },
        formaPagamento: true,
        operador: {
          select: {
            operadorId: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        data: "desc",
      },
    });

    const valorTotalVendas = vendas.reduce(
      (total, venda) => total + venda.valor,
      0
    );

    // Busca sangrias do período
    const sangrias = await prisma.pdvSangria.findMany({
      where: {
        frenteCaixaId: pdvId,
        data: {
          gte: aberturaCaixa.dataAbertura!,
        },
      },
      include: {
        operador: {
          select: {
            operadorId: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    // Busca suprimentos do período
    const suprimentos = await prisma.pdvSuprimento.findMany({
      where: {
        frenteCaixaId: pdvId,
        data: {
          gte: aberturaCaixa.dataAbertura!,
        },
      },
      include: {
        operador: {
          select: {
            operadorId: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    const totalSangrias = sangrias.reduce(
      (total, sangria) => total + sangria.valor,
      0
    );
    const totalSuprimentos = suprimentos.reduce(
      (total, suprimento) => total + suprimento.valor,
      0
    );

    // Atualiza o cálculo do valor final
    const valorFinal =
      (aberturaCaixa.valorInicial ?? 0) +
      valorTotalVendas +
      totalSuprimentos -
      totalSangrias;

    // Atualiza o PDV e cria operação de fechamento
    const pdv = await prisma.$transaction(async (prisma) => {
      const pdvAtualizado = await prisma.pdvFrenteDeCaixa.update({
        where: {
          id: pdvId,
          status: "ABERTO",
          userTenantId: operador.id,
        },
        data: {
          status: "FECHADO",
          userTenantId: null,
        },
      });

      await prisma.pdvCaixaOperacao.update({
        where: {
          id: aberturaCaixa.id,
        },
        data: {
          valorFinal,
          observacao,
          dataFechamento: new Date(),
        },
      });

      return pdvAtualizado;
    });

    return res.status(200).json({
      success: true,
      message: "Caixa fechado com sucesso",
      data: {
        pdv,
        vendas,
        sangrias,
        suprimentos,
        resumo: {
          valorInicial: aberturaCaixa.valorInicial,
          totalVendas: valorTotalVendas,
          totalSangrias,
          totalSuprimentos,
          valorFinal,
          quantidadeVendas: vendas.length,
          quantidadeSangrias: sangrias.length,
          quantidadeSuprimentos: suprimentos.length,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao fechar caixa:", error);
    return res.status(500).json({ error: "Erro ao fechar caixa" });
  }
};

// Registrar uma sangria
export const registrarSangria = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha, valor, motivo } = req.body;

    if (!pdvId || !operadorId || !operadorSenha || !valor) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador, senha e valor são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const sangria = await prisma.pdvSangria.create({
      data: {
        frenteCaixaId: Number(pdvId),
        valor,
        motivo,
        operadorId: operador.id,
      },
    });

    return res.status(201).json(sangria);
  } catch (error) {
    console.error("Erro ao registrar sangria:", error);
    return res.status(500).json({ error: "Erro ao registrar sangria" });
  }
};

// Registrar um suprimento
export const registrarSuprimento = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha, valor, motivo } = req.body;

    if (!pdvId || !operadorId || !operadorSenha || !valor) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador, senha e valor são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const suprimento = await prisma.pdvSuprimento.create({
      data: {
        frenteCaixaId: Number(pdvId),
        valor,
        motivo,
        operadorId: operador.id,
      },
    });

    return res.status(201).json(suprimento);
  } catch (error) {
    console.error("Erro ao registrar suprimento:", error);
    return res.status(500).json({ error: "Erro ao registrar suprimento" });
  }
};

// Buscar caixa atual do operador
export const getCaixaAtual = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha } = req.body;

    if (!pdvId || !operadorId || !operadorSenha) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, ID do operador e senha são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Verifica se existe uma operação de abertura sem fechamento
    const ultimaOperacao = await prisma.pdvCaixaOperacao.findFirst({
      where: {
        frenteCaixaId: Number(pdvId),
        tipo: "ABERTURA",
        dataFechamento: null,
      },
      orderBy: {
        dataAbertura: "desc",
      },
    });

    if (ultimaOperacao && ultimaOperacao.dataAbertura) {
      // Verifica se a abertura é de um dia anterior
      const dataAbertura = new Date(ultimaOperacao.dataAbertura);
      const hoje = new Date();

      if (
        dataAbertura.getDate() < hoje.getDate() ||
        dataAbertura.getMonth() < hoje.getMonth() ||
        dataAbertura.getFullYear() < hoje.getFullYear()
      ) {
        return res.status(400).json({
          error: "Caixa com fechamento pendente",
          message:
            "O caixa foi aberto em um dia anterior e precisa ser fechado. Após o fechamento, abra o caixa novamente.",
          dataAbertura: dataAbertura,
        });
      }
    }

    const caixaAtual = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        id: Number(pdvId),
        tenant: { slug: tenantSlug },
        userTenantId: operador.id,
        status: "ABERTO",
      },
      include: {
        UserTenant: {
          select: {
            id: true,
            operadorId: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
        formasPagamento: {
          include: {
            formaPagamento: true,
          },
        },
      },
    });

    if (!caixaAtual) {
      return res.status(403).json({
        error: "PDV não encontrado ou você não tem permissão para acessá-lo",
        message: "Verifique se o PDV está aberto e se você é o operador atual",
      });
    }

    return res.status(200).json({
      success: true,
      data: caixaAtual,
    });
  } catch (error) {
    console.error("Erro ao buscar caixa atual:", error);
    return res.status(500).json({ error: "Erro ao buscar caixa atual" });
  }
};

export const getAllPdvs = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    const pdvs = await prisma.pdvFrenteDeCaixa.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        formasPagamento: {
          include: {
            formaPagamento: {
              select: {
                id: true,
                nome: true,
                tipo: true,
                aceitaTroco: true,
                aceitaIntegracao: true,
                ativo: true,
              },
            },
          },
        },
        UserTenant: {
          select: {
            id: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
      orderBy: {
        pdv: "asc",
      },
    });

    const pdvsFormatados = pdvs.map((pdv) => ({
      id: pdv.id,
      pdv: pdv.pdv,
      status: pdv.status,
      operador: pdv.UserTenant
        ? {
            id: pdv.UserTenant.id,
            nome: pdv.UserTenant.user.nome,
          }
        : null,
      formasPagamento: pdv.formasPagamento.map((fp) => ({
        id: fp.formaPagamento.id,
        nome: fp.formaPagamento.nome,
        tipo: fp.formaPagamento.tipo,
        aceitaTroco: fp.formaPagamento.aceitaTroco,
        aceitaIntegracao: fp.formaPagamento.aceitaIntegracao,
        ativo: fp.ativo,
      })),
    }));

    return res.status(200).json({
      success: true,
      data: pdvsFormatados,
    });
  } catch (error) {
    console.error("Erro ao buscar PDVs:", error);
    return res.status(500).json({
      error: "Erro ao buscar PDVs",
      details: error,
    });
  }
};

export const registrarOrderAndVendaPdv = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantSlug } = req.params;
    const {
      pdvId,
      operadorId,
      operadorSenha,
      produtos,
      valor,
      formaPagamentoId,
    } = req.body;

    if (
      !pdvId ||
      !operadorId ||
      !operadorSenha ||
      !produtos ||
      !valor ||
      !formaPagamentoId
    ) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "Todos os campos são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Verifica se o PDV está aberto e pertence ao operador
    const pdv = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        id: Number(pdvId),
        tenantId: tenant.id,
        status: "ABERTO",
        userTenantId: operador.id,
      },
    });

    if (!pdv) {
      return res.status(404).json({
        error: "PDV não encontrado ou não está aberto para este operador",
      });
    }

    // Verifica forma de pagamento
    const formaPagamento = await prisma.formasPagamento.findUnique({
      where: { id: Number(formaPagamentoId) },
    });

    if (!formaPagamento) {
      return res
        .status(404)
        .json({ error: "Forma de pagamento não encontrada" });
    }

    // Resto do código continua igual...
    const result = await prisma.$transaction(async (prisma) => {
      // Gera o número da venda
      const ultimaVenda = await prisma.venda.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { id: "desc" },
      });
      const ultimoNumero = ultimaVenda ? parseInt(ultimaVenda.nrVenda) : 0;
      const nrVenda = (ultimoNumero + 1).toString().padStart(5, "0");

      const order = await prisma.order.create({
        data: {
          tenant: {
            connect: { id: tenant.id },
          },
          status: "PAGO",
          origem: pdv.pdv,
          preco: Number(valor),
          subtotal: Number(valor),
          shippingPrice: 0,
          troco: 0,
          formaPagamento: {
            connect: { id: Number(formaPagamentoId) },
          },
          products: {
            create: produtos.map((p: any) => ({
              id_produto: p.id,
              nome_produto: p.nome,
              preco_produto: p.preco,
              quantidade: p.quantidade,
            })),
          },
        },
      });

      const venda = await prisma.venda.create({
        data: {
          nrVenda: nrVenda,
          tenant: {
            connect: { id: tenant.id },
          },
          frenteCaixa: {
            connect: { id: pdv.id },
          },
          valor: Number(valor),
          status: "ACEITO",
          formaPagamento: {
            connect: { id: Number(formaPagamentoId) },
          },
          operador: {
            connect: { id: operador.id },
          },
          order: {
            connect: { id: order.id },
          },
        },
        include: {
          order: {
            include: {
              products: true,
            },
          },
          formaPagamento: true,
          operador: {
            select: {
              operadorId: true,
              user: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      });

      return { order, venda };
    });

    return res.status(200).json({
      success: true,
      message: "Venda registrada com sucesso",
      data: result,
    });
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    return res.status(500).json({ error: "Erro ao registrar venda" });
  }
};

export const trocarOperador = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha } = req.body;

    if (!pdvId || !operadorId || !operadorSenha) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, ID do operador e senha são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o PDV está aberto
    const pdv = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        id: Number(pdvId),
        tenantId: tenant.id,
        status: "ABERTO",
      },
    });

    if (!pdv) {
      return res.status(404).json({
        error: "PDV não encontrado ou não está aberto",
      });
    }

    // Verifica se o novo operador existe e está ativo
    const novoOperador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!novoOperador || !novoOperador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica se o operador já está em outro PDV
    const pdvOperador = await prisma.pdvFrenteDeCaixa.findFirst({
      where: {
        tenantId: tenant.id,
        userTenantId: novoOperador.id,
        status: "ABERTO",
      },
    });

    if (pdvOperador) {
      return res.status(400).json({ error: "Operador já está em outro PDV" });
    }

    // Verifica a senha do operador
    const senhaCorreta = novoOperador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, novoOperador.operadorSenha)
      : operadorSenha === novoOperador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Atualiza o operador do PDV
    const pdvAtualizado = await prisma.pdvFrenteDeCaixa.update({
      where: {
        id: pdv.id,
      },
      data: {
        userTenantId: novoOperador.id,
      },
      include: {
        UserTenant: {
          select: {
            operadorId: true,
            user: {
              select: {
                nome: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Operador trocado com sucesso",
      data: {
        pdv: pdvAtualizado,
        operador: {
          id: novoOperador.id,
          operadorId: novoOperador.operadorId,
          nome: pdvAtualizado.UserTenant?.user.nome,
        },
      },
    });
  } catch (error) {
    console.error("Erro ao trocar operador:", error);
    return res.status(500).json({ error: "Erro ao trocar operador" });
  }
};

export const cancelarVendaPdv = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha, nrVenda } = req.body;

    if (!pdvId || !operadorId || !operadorSenha || !nrVenda) {
      return res.status(400).json({
        error: "Dados inválidos",
        message:
          "PDV, operador, senha, número da venda e motivo são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Busca a venda pelo número
    const venda = await prisma.venda.findFirst({
      where: {
        nrVenda: nrVenda,
        tenantId: tenant.id,
        frenteCaixaId: Number(pdvId),
        status: "ACEITO",
      },
      include: {
        order: true,
      },
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
        message:
          "Verifique se o número da venda está correto e se ela ainda pode ser cancelada",
      });
    }

    // Atualiza o status da venda e do pedido
    const vendaAtualizada = await prisma.$transaction(async (prisma) => {
      // Atualiza a venda
      const vendaUpdate = await prisma.venda.update({
        where: { id: venda.id },
        data: {
          status: "CANCELADO",
        },
        include: {
          order: true,
          formaPagamento: true,
          operador: {
            select: {
              operadorId: true,
              user: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      });

      // Atualiza o pedido
      await prisma.order.update({
        where: { id: venda.orderId },
        data: {
          status: "CANCELADO",
        },
      });

      return vendaUpdate;
    });

    return res.status(200).json({
      success: true,
      message: "Venda cancelada com sucesso",
      data: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao cancelar venda:", error);
    return res.status(500).json({ error: "Erro ao cancelar venda" });
  }
};

export const cancelarUltimaVendaPdv = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha } = req.body;

    if (!pdvId || !operadorId || !operadorSenha) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador e senha são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Busca a última venda do PDV
    const ultimaVenda = await prisma.venda.findFirst({
      where: {
        tenantId: tenant.id,
        frenteCaixaId: Number(pdvId),
        status: "ACEITO",
      },
      orderBy: {
        data: "desc",
      },
      include: {
        order: true,
      },
    });

    if (!ultimaVenda) {
      return res.status(404).json({
        error: "Nenhuma venda encontrada",
        message: "Não há vendas disponíveis para cancelamento",
      });
    }

    // Atualiza o status da venda e do pedido
    const vendaAtualizada = await prisma.$transaction(async (prisma) => {
      // Atualiza a venda
      const vendaUpdate = await prisma.venda.update({
        where: { id: ultimaVenda.id },
        data: {
          status: "CANCELADO",
        },
        include: {
          order: true,
          formaPagamento: true,
          operador: {
            select: {
              operadorId: true,
              user: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      });

      // Atualiza o pedido
      await prisma.order.update({
        where: { id: ultimaVenda.orderId },
        data: {
          status: "CANCELADO",
        },
      });

      return vendaUpdate;
    });

    return res.status(200).json({
      success: true,
      message: "Última venda cancelada com sucesso",
      data: vendaAtualizada,
    });
  } catch (error) {
    console.error("Erro ao cancelar última venda:", error);
    return res.status(500).json({ error: "Erro ao cancelar última venda" });
  }
};

export const reimprimirUltimoCupom = async (req: Request, res: Response) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha } = req.body;

    if (!pdvId || !operadorId || !operadorSenha) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador e senha são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Busca a última venda do PDV
    const ultimaVenda = await prisma.venda.findFirst({
      where: {
        tenantId: tenant.id,
        frenteCaixaId: Number(pdvId),
      },
      orderBy: {
        data: "desc",
      },
      include: {
        order: {
          include: {
            products: true,
          },
        },
        formaPagamento: true,
        operador: {
          select: {
            operadorId: true,
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
    });

    if (!ultimaVenda) {
      return res.status(404).json({
        error: "Nenhuma venda encontrada",
        message: "Não há vendas registradas neste PDV",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dados do último cupom recuperados com sucesso",
      data: ultimaVenda,
    });
  } catch (error) {
    console.error("Erro ao recuperar último cupom:", error);
    return res.status(500).json({ error: "Erro ao recuperar último cupom" });
  }
};

export const reimprimirCupomEspecifico = async (
  req: Request,
  res: Response
) => {
  try {
    const { tenantSlug } = req.params;
    const { pdvId, operadorId, operadorSenha, nrVenda } = req.body;

    if (!pdvId || !operadorId || !operadorSenha || !nrVenda) {
      return res.status(400).json({
        error: "Dados inválidos",
        message: "PDV, operador, senha e número da venda são obrigatórios",
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Verifica se o operador existe e está ativo
    const operador = await prisma.userTenant.findFirst({
      where: {
        operadorId: operadorId,
        tenantId: tenant.id,
        active: true,
      },
    });

    if (!operador || !operador.operadorSenha) {
      return res.status(401).json({ error: "Operador não encontrado" });
    }

    // Verifica a senha do operador
    const senhaCorreta = operador.operadorSenha.startsWith("$2b$")
      ? await bcrypt.compare(operadorSenha, operador.operadorSenha)
      : operadorSenha === operador.operadorSenha;

    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    // Busca a venda específica
    const venda = await prisma.venda.findFirst({
      where: {
        nrVenda: nrVenda,
        tenantId: tenant.id,
        frenteCaixaId: Number(pdvId),
      },
      include: {
        order: {
          include: {
            products: true,
          },
        },
        formaPagamento: true,
        operador: {
          select: {
            operadorId: true,
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
    });

    if (!venda) {
      return res.status(404).json({
        error: "Venda não encontrada",
        message: "Verifique se o número da venda está correto",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dados do cupom recuperados com sucesso",
      data: venda,
    });
  } catch (error) {
    console.error("Erro ao recuperar cupom:", error);
    return res.status(500).json({ error: "Erro ao recuperar cupom" });
  }
};
