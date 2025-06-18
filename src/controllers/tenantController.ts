import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ExtendedRequest } from "../types/extended-request";
import jwt from "jsonwebtoken";
import { updateTenantSchema, createTenantLayoutSchema } from "../schema/Tenant";
import {
  updateTenantInfosSchema,
  createTenantInfoSchema,
} from "../schema/TenantInfo";
import { updateTenantZoneSchema } from "../schema/zone";
import {
  updateTenantFuncSchema,
  createTenantFuncSchema,
} from "../schema/TenantFunc";
import { updateTenantEndecSchema } from "../schema/TenantEndec";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.DEFAULT_TOKEN || "default_secret";

export const getTenantBySlug = async (req: ExtendedRequest, res: Response) => {
  try {
    const tenantSlug = req.params.tenantSlug;

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: {
        tenantInfo: true, // Inclui os dados da tabela TenantInfo
        tenantFuncionamento: true, // Inclui os dados da tabela TenantFuncionamento
        zone: true,
        banners: true,
        formasPagamento: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).send("Tenant não encontrado");
    }
  } catch (error) {
    console.error("Erro ao obter informações do tenant:", error);
    res.status(500).send("Erro ao obter informações do tenant");
  } finally {
    await prisma.$disconnect();
  }
};

export const getTenantById = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.tenantId, 10);

    if (isNaN(tenantId)) {
      return res.status(400).json({ message: "ID do Tenant inválido." });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenantInfo: true, // Inclui os dados da tabela TenantInfo
        tenantFuncionamento: true, // Inclui os dados da tabela TenantFuncionamento
        zone: true,
        banners: true,
        formasPagamento: true,
      },
    });

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao obter informações do tenant:", error);
    res.status(500).json({ message: "Erro ao obter informações do tenant" });
  } finally {
    await prisma.$disconnect();
  }
};

export const getTenantOpenClose = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;

  try {
    // Consulta no banco de dados para encontrar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { OnClose: true }, // Seleciona apenas o campo `isOpen`
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado" });
    }

    // Retorna o status atual do tenant (aberto/fechado)
    return res.status(200).json({ isOpen: tenant.OnClose });
  } catch (error) {
    console.error("Erro ao buscar o status do tenant:", error);
    return res.status(500).json({ error: "Erro ao buscar o status do tenant" });
  }
};

export const setTenantOpenClose = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;

  if (!tenantSlug) {
    return res.status(400).json({ error: "Tenant slug não fornecido." });
  }

  try {
    // Busca o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Alterna o status de "aberto"
    const updatedTenant = await prisma.tenant.update({
      where: { slug: tenantSlug },
      data: { OnClose: !tenant.OnClose },
    });

    res.status(200).json({
      message: `Status da loja atualizado para ${
        updatedTenant.OnClose ? "Aberto" : "Fechado"
      }.`,
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao atualizar status da loja." });
  }
};

export const getAllTenantByUser = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho Authorization

  if (!token) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido." });
  }

  try {
    // Verifica e decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Busca todos os tenants associados ao userId do token
    const tenants = await prisma.userTenant.findMany({
      where: { userId: decoded.id },
      select: {
        tenant: {
          select: {
            id: true,
            nome: true,
            slug: true,
            img: true,
            OnClose: true,
            status: true,
            tenantInfo: {
              select: {
                cnpj: true,
                cep: true,
                rua: true,
                numero: true,
                bairro: true,
                cidade: true,
                estado: true,
              },
            },
          },
        },
        roles: {
          select: {
            codigo: true,
          },
        },
      },
    });

    // Verifica se o usuário está associado a algum tenant
    if (tenants.length === 0) {
      return res
        .status(404)
        .json({ error: "Nenhum tenant associado a este usuário." });
    }

    // Mapeia os tenants para enviar apenas os dados necessários na resposta
    const tenantData = tenants.map((userTenant) => ({
      id: userTenant.tenant.id,
      nome: userTenant.tenant.nome,
      slug: userTenant.tenant.slug,
      status: userTenant.tenant.status,
      OnClose: userTenant.tenant.OnClose,
      img: userTenant.tenant.img,
      tenantInfo: userTenant.tenant.tenantInfo,
      roles: userTenant.roles.map((r) => r.codigo),
    }));

    res.status(200).json(tenantData);
  } catch (error) {
    console.error("Erro ao buscar tenants:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token inválido." });
    }

    res.status(500).json({ error: "Erro ao buscar tenants", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateTenantLayout = async (req: Request, res: Response) => {
  const tenantId = parseInt(req.params.tenantId, 10);

  // Verificar se o ID do tenant é válido
  if (isNaN(tenantId)) {
    return res.status(400).json({ error: "ID do Tenant inválido." });
  }

  // Extrair os campos textuais do corpo da requisição
  const { nome, main_color, second_color } = req.body;

  // Extrair o arquivo da imagem do upload (via Multer)
  const img = (req.file as any)?.location || (req.file as any)?.path; // Ajuste dependendo do local de armazenamento

  // Validar se ao menos um campo foi fornecido
  if (!nome && !main_color && !second_color && !img) {
    return res.status(400).json({
      error:
        "É necessário fornecer ao menos um campo para atualização (nome, cor principal, cor secundária, imagem).",
    });
  }

  try {
    // Buscar o tenant pelo ID
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Preparar os dados para atualização
    const data = {
      nome: nome ?? tenant.nome,
      main_color: main_color ?? tenant.main_color,
      img: img ?? tenant.img, // Usa a nova imagem, se fornecida
    };

    // Validar os dados com o schema
    const validationResult = updateTenantSchema.safeParse(data);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    // Atualizar os dados do tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: validationResult.data, // Dados validados
    });

    // Retornar a resposta com a confirmação da atualização
    res.status(200).json({
      message: "Layout do tenant atualizado com sucesso.",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao atualizar layout do tenant:", error);
    res.status(500).json({ error: "Erro ao atualizar layout do tenant." });
  }
};

export const updateTenantInfos = async (req: Request, res: Response) => {
  const tenantId = parseInt(req.params.tenantId, 10);

  if (isNaN(tenantId)) {
    return res.status(400).json({ error: "ID do Tenant inválido." });
  }
  const { cnpj, telefone, whatsapp, instagram } = req.body;

  console.log(cnpj, telefone, whatsapp, instagram);

  if (!cnpj && !telefone && !whatsapp && !instagram) {
    return res.status(400).json({
      error: "É necessário fornecer ao menos um campo para atualização.",
    });
  }

  try {
    const tenantInfo = await prisma.tenantInfo.findUnique({
      where: { tenantId: tenantId },
    });

    if (!tenantInfo) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const data = {
      cnpj: cnpj ?? tenantInfo.cnpj,
      telefone: telefone ?? tenantInfo.telefone,
      whatsapp: whatsapp ?? tenantInfo.whatsapp,
      instagram: instagram ?? tenantInfo.instagram,
    };

    const validationResult = updateTenantInfosSchema.safeParse(data);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const updatedTenant = await prisma.tenantInfo.update({
      where: { tenantId: tenantId },
      data: validationResult.data,
    });

    res.status(200).json({
      message: "Informações do tenant atualizadas com sucesso.",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao atualizar informações do tenant:", error);
    res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
  }
};

export const updateTenantFunc = async (req: Request, res: Response) => {
  const tenantId = parseInt(req.params.tenantId, 10);

  if (isNaN(tenantId)) {
    return res.status(400).json({ error: "ID do Tenant inválido." });
  }

  const {
    segOpen,
    segClose,
    terOpen,
    terClose,
    quarOpen,
    quarClose,
    quinOpen,
    quinClose,
    sexOpen,
    sexClose,
    sabOpen,
    sabClose,
    domOpen,
    domClose,
  } = req.body;

  if (
    !segOpen &&
    !segClose &&
    !terOpen &&
    !terClose &&
    !quarOpen &&
    !quarClose &&
    !quinOpen &&
    !quinClose &&
    !sexOpen &&
    !sexClose &&
    !sabOpen &&
    !sabClose &&
    !domOpen &&
    !domClose
  ) {
    return res.status(400).json({
      error: "É necessário fornecer ao menos um campo para atualização.",
    });
  }

  try {
    const tenantFunc = await prisma.tenantFuncionamento.findUnique({
      where: { tenantId: tenantId },
    });

    if (!tenantFunc) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const data = {
      segOpen: segOpen ?? tenantFunc.segOpen,
      segClose: segClose ?? tenantFunc.segClose,
      terOpen: terOpen ?? tenantFunc.terOpen,
      terClose: terClose ?? tenantFunc.terClose,
      quaOpen: quarOpen ?? tenantFunc.quarOpen,
      quaClose: quarClose ?? tenantFunc.quarClose,
      quiOpen: quinOpen ?? tenantFunc.quinOpen,
      quiClose: quinClose ?? tenantFunc.quinClose,
      sexOpen: sexOpen ?? tenantFunc.sexOpen,
      sexClose: sexClose ?? tenantFunc.sexClose,
      sabOpen: sabOpen ?? tenantFunc.sabOpen,
      sabClose: sabClose ?? tenantFunc.sabClose,
      domOpen: domOpen ?? tenantFunc.domOpen,
      domClose: domClose ?? tenantFunc.domClose,
    };

    const validationResult = updateTenantFuncSchema.safeParse(data);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const updatedTenant = await prisma.tenantFuncionamento.update({
      where: { tenantId: tenantId },
      data: validationResult.data,
    });

    res.status(200).json({
      message:
        "Informações de Horarios de Funcionamento atualizadas com sucesso.",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao atualizar informações do tenant:", error);
    res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
  }
};

export const updateTenantZone = async (req: Request, res: Response) => {
  const tenantId = parseInt(req.params.tenantId, 10);

  if (isNaN(tenantId)) {
    return res.status(400).json({ error: "ID do Tenant inválido." });
  }

  const {
    maxDistanceKm,
    fixedFee,
    additionalKmFee,
    fixedDistanceKm,
    tempoMaxEntre,
  } = req.body;

  if (
    !maxDistanceKm &&
    !fixedFee &&
    !additionalKmFee &&
    !fixedDistanceKm &&
    !tempoMaxEntre
  ) {
    return res.status(400).json({
      error: "É necessário fornecer ao menos um campo para atualização.",
    });
  }

  try {
    const tenantZone = await prisma.zone.findUnique({
      where: { tenantId: tenantId },
    });

    if (!tenantZone) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const data = {
      maxDistanceKm: maxDistanceKm ?? tenantZone.maxDistanceKm,
      fixedFee: fixedFee ?? tenantZone.fixedFee,
      additionalKmFee: additionalKmFee ?? tenantZone.additionalKmFee,
      fixedDistanceKm: fixedDistanceKm ?? tenantZone.fixedDistanceKm,
      tempoMaxEntre: tempoMaxEntre ?? tenantZone.tempoMaxEntre,
    };

    const validationResult = updateTenantZoneSchema.safeParse(data);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const updatedTenant = await prisma.zone.update({
      where: { tenantId: tenantId },
      data: validationResult.data,
    });

    res.status(200).json({
      message: "Informações do tenantZone atualizadas com sucesso.",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao atualizar informações do tenant:", error);
    res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
  }
};

export const updateTenantEnder = async (req: Request, res: Response) => {
  const tenantId = parseInt(req.params.tenantId, 10);

  if (isNaN(tenantId)) {
    return res.status(400).json({ error: "ID do Tenant inválido." });
  }

  const { cep, rua, cidade, estado, numero, bairro } = req.body;

  if (!cep && !rua && !cidade && !estado && !numero && !bairro) {
    return res.status(400).json({
      error: "É necessário fornecer ao menos um campo para atualização.",
    });
  }

  try {
    const tenantInfo = await prisma.tenantInfo.findUnique({
      where: { tenantId: tenantId },
    });

    if (!tenantInfo) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const data = {
      cep: cep ?? tenantInfo.cep,
      rua: rua ?? tenantInfo.rua,
      numero: numero ?? tenantInfo.numero,
      bairro: bairro ?? tenantInfo.bairro,
      cidade: cidade ?? tenantInfo.cidade,
      estado: estado ?? tenantInfo.estado,
    };

    const validationResult = updateTenantEndecSchema.safeParse(data);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const updatedTenant = await prisma.tenantInfo.update({
      where: { tenantId: tenantId },
      data: validationResult.data,
    });

    res.status(200).json({
      message: "Informações do tenant atualizadas com sucesso.",
      tenant: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao atualizar informações do tenant:", error);
    res.status(500).json({ error: "Erro ao atualizar informações do tenant." });
  }
};

//Painel Admin

export const createTenantLayout = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Token de autenticação não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = decoded.id;

    // Busca os valores de faturamento padrão do usuário admin
    const adminFaturamento = await prisma.valoresFaturamento.findUnique({
      where: { userId },
    });

    if (!adminFaturamento) {
      return res.status(403).json({
        message:
          "O usuário atual não tem permissão ou valores de faturamento configurados para criar um restaurante.",
      });
    }

    const { body } = req;
    const img = (req.file as any)?.location || (req.file as any)?.path;

    // 1. Validar os dados de entrada
    const validationResult = createTenantLayoutSchema.safeParse(body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const { nome, slug, main_color, second_color } = validationResult.data;

    // 2. Verificar se o tenant já existe (antes da transação)
    const existingTenant = await prisma.tenant.findFirst({
      where: { slug },
    });

    if (existingTenant) {
      return res
        .status(409)
        .json({ message: "Já existe um Restaurante com este slug." });
    }

    const result = await prisma.$transaction(async (prisma) => {
      // 4. Criar o novo tenant
      const newTenant = await prisma.tenant.create({
        data: {
          nome,
          slug,
          main_color,
          img: img ?? "",
          status: true,
          OnClose: false,
        },
      });

      // Criar categoria Destaques automaticamente
      await prisma.category.create({
        data: {
          nome: "Destaques",
          id_tenant: newTenant.id,
          ativo: true,
        },
      });

      // 5. Associar usuário ao tenant com cargo
      await prisma.userTenant.create({
        data: {
          userId: userId,
          tenantId: newTenant.id,
          cargo: "admin",
          active: true,
        },
      });

      // 6. Criar o registro de faturamento para o tenant, com os valores daquele momento
      await prisma.tenantsFaturamento.create({
        data: {
          tenantId: newTenant.id,
          valorMensalidade: adminFaturamento.valorMensalidade,
          valorImplantacao: adminFaturamento.valorImplantacao,
        },
      });

      return newTenant;
    });

    // 7. Retornar o tenant criado
    res.status(201).json({
      message: "Restaurante criado com sucesso!",
      tenant: result,
    });
  } catch (error) {
    console.error("Erro ao criar layout do Restaurante:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token inválido." });
    }
    // A verificação de slug duplicado foi movida para cima
    res.status(500).json({ message: "Erro interno ao criar o Restaurante." });
  } finally {
    await prisma.$disconnect();
  }
};

export const createTenantInfoEnder = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
      return res.status(400).json({ message: "ID do Tenant inválido." });
    }

    // Verificar se já existe um TenantInfo para este tenant
    const existingInfo = await prisma.tenantInfo.findUnique({
      where: { tenantId },
    });
    if (existingInfo) {
      return res.status(409).json({
        message:
          "As informações de contato e endereço para este restaurante já existem.",
      });
    }

    const validationResult = createTenantInfoSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const data = {
      ...validationResult.data,
      tenantId,
      latitude: 0, // Default value
      longitude: 0, // Default value
    };

    // Usar uma transação para garantir que ambas as tabelas sejam criadas
    const result = await prisma.$transaction(async (prisma) => {
      // 1. Criar TenantInfo
      const newTenantInfo = await prisma.tenantInfo.create({ data });

      // 2. Criar Zone com valores padrão
      const newZone = await prisma.zone.create({
        data: {
          tenantId: tenantId,
          maxDistanceKm: 10,
          fixedFee: 5,
          additionalKmFee: 1,
          fixedDistanceKm: 5,
          tempoMaxEntre: 60,
        },
      });

      return { newTenantInfo, newZone };
    });

    res.status(201).json({
      message:
        "Informações e zona de entrega do restaurante criadas com sucesso.",
      data: result,
    });
  } catch (error) {
    console.error("Erro ao criar informações do tenant:", error);
    res.status(500).json({ message: "Erro interno ao criar informações." });
  } finally {
    await prisma.$disconnect();
  }
};

export const createTenantFunc = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
      return res.status(400).json({ message: "ID do Tenant inválido." });
    }

    const existingFunc = await prisma.tenantFuncionamento.findUnique({
      where: { tenantId },
    });
    if (existingFunc) {
      return res.status(409).json({
        message:
          "Os horários de funcionamento para este restaurante já existem.",
      });
    }

    const validationResult = createTenantFuncSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Dados inválidos",
        details: validationResult.error.issues,
      });
    }

    const data = { ...validationResult.data, tenantId };

    const newTenantFunc = await prisma.tenantFuncionamento.create({ data });

    res.status(201).json({
      message: "Horários de funcionamento criados com sucesso.",
      data: newTenantFunc,
    });
  } catch (error) {
    console.error("Erro ao criar horários de funcionamento:", error);
    res.status(500).json({ message: "Erro interno ao criar horários." });
  } finally {
    await prisma.$disconnect();
  }
};

export const toggleTenantStatus = async (req: Request, res: Response) => {
  try {
    const tenantId = parseInt(req.params.tenantId, 10);
    if (isNaN(tenantId)) {
      return res.status(400).json({ message: "ID do Tenant inválido." });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Token de autenticação não fornecido." });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };

    // Verificar se o usuário logado tem acesso ao tenant
    const userTenant = await prisma.userTenant.findFirst({
      where: { userId: decoded.id, tenantId },
    });

    if (!userTenant) {
      return res.status(403).json({
        message: "Você não tem permissão para alterar este restaurante.",
      });
    }

    // Buscar o tenant para obter o status atual
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Restaurante não encontrado." });
    }

    // Inverter o status
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: !tenant.status,
      },
    });

    res.status(200).json({
      message: `Status do restaurante atualizado para ${
        updatedTenant.status ? "ativo" : "inativo"
      }.`,
      data: updatedTenant,
    });
  } catch (error) {
    console.error("Erro ao alterar status do restaurante:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Token inválido." });
    }
    res
      .status(500)
      .json({ message: "Erro interno ao alterar o status do restaurante." });
  } finally {
    await prisma.$disconnect();
  }
};
