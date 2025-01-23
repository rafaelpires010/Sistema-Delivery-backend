import { Request, RequestHandler, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addBanner: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const img = (req.file as any)?.location; // URL da imagem provida pelo multer-s3

  // Tenant slug fornecido como parâmetro da URL
  const tenantSlug = req.params.tenantSlug;

  if (!img || !tenantSlug) {
    return res
      .status(400)
      .json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    // Localizar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const data = {
      img, // URL da imagem do S3
      id_tenant: tenant.id, // Associa o banner ao tenant
    };

    // Criar o banner
    const newBanner = await prisma.banner.create({
      data,
    });

    res.status(201).json(newBanner);
  } catch (error) {
    console.error("Erro ao adicionar banner:", error);
    res.status(500).json({ error: "Erro ao adicionar banner", details: error });
  } finally {
    await prisma.$disconnect();
  }

  console.log("Arquivo recebido:", req.file);
};

export const getBannersByTenant: RequestHandler = async (
  req: Request,
  res: Response
) => {
  // Obter o slug do tenant a partir dos parâmetros da URL
  const tenantSlug = req.params.tenantSlug;

  if (!tenantSlug) {
    return res
      .status(400)
      .json({ error: "O slug do tenant deve ser fornecido." });
  }

  try {
    // Localizar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Recuperar todos os banners associados ao tenant
    const banners = await prisma.banner.findMany({
      where: { id_tenant: tenant.id },
    });

    // Retornar os banners
    res.status(200).json(banners);
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    res.status(500).json({ error: "Erro ao buscar banners", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteBannerByID: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const bannerId = parseInt(req.params.bannerId, 10);
  const tenantSlug = req.params.tenantSlug;

  if (isNaN(bannerId)) {
    return res.status(400).json({ error: "ID do Banner inválido." });
  }

  try {
    // Buscar o tenant pelo slug
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    // Verificar se o banner pertence ao tenant
    const banner = await prisma.banner.findFirst({
      where: {
        id: bannerId,
        id_tenant: tenant.id,
      },
    });

    if (!banner) {
      return res
        .status(404)
        .json({ error: "Banner não encontrado ou não pertence ao tenant." });
    }

    // Deletar o produto
    await prisma.banner.delete({
      where: { id: bannerId },
    });

    res.status(200).json({ message: "Banner deletado com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto", details: error });
  } finally {
    await prisma.$disconnect();
  }
};
