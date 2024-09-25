import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllOrders = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const orders = await prisma.order.findMany({
      where: { id_tenant: tenant.id },
      include: {
        address: {
          select: {
            rua: true,
            numero: true,
            cep: true,
            cidade: true,
            estado: true,
            complemento: true,
          },
        },
        products: {
          select: {
            id_produto: true,
            preco_produto: true,
            quantidade: true,
            product: {
              select: {
                nome: true,
                descricao: true,
                img: true,
                preco: true,
                category: true,
              },
            },
          },
        },
        statuses: true,
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos", details: error });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Verificar se o pedido existe
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        products: {
          select: {
            id_produto: true,
            preco_produto: true,
            quantidade: true,
            product: {
              select: {
                nome: true,
                descricao: true,
                img: true,
                preco: true,
                category: true,
              },
            },
          },
        },
        statuses: {
          select: {
            status: true,
            created_at: true,
          },
        },
        address: {
          select: {
            rua: true,
            numero: true,
            complemento: true,
            cep: true,
            cidade: true,
            estado: true,
          },
        },
        user: {
          select: {
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    console.log("Pedido encontrado:", order);
    res.status(200).json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;
  const {
    id_user,
    id_address,
    metodo_pagamento,
    troco,
    preco,
    subtotal,
    data_order,
    status,
    products,
    statuses,
  } = req.body;

  console.log("Dados recebidos para criação do pedido:", {
    tenantSlug,
    id_user,
    id_address,
    metodo_pagamento,
    troco,
    preco,
    subtotal,
    data_order,
    status,
    products,
    statuses,
  });

  try {
    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      console.log("Tenant não encontrado:", tenantSlug);
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    console.log("Tenant encontrado:", tenant);

    // Verificar se o usuário existe
    const userId: number = id_user;
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      console.log("Usuário não encontrado:", userId);
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Verificar se o endereço existe
    const addressId: number = id_address;
    const addressExists = await prisma.user_Address.findUnique({
      where: { id: addressId },
    });

    if (!addressExists) {
      console.log("Endereço não encontrado:", addressId);
      return res.status(404).json({ error: "Endereço não encontrado." });
    }

    // Verificar se os produtos existem
    const productIds: number[] = products.map(
      (product: any) => product.id_produto
    );
    const productsExist = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const existingProductIds = productsExist.map((product) => product.id);
    const invalidProducts = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    if (invalidProducts.length > 0) {
      console.log("Produtos não encontrados:", invalidProducts);
      return res
        .status(404)
        .json({ error: "Um ou mais produtos não encontrados." });
    }

    console.log("Todos os produtos encontrados:", productsExist);

    // Criar o pedido
    const newOrder = await prisma.order.create({
      data: {
        id_user: userId,
        id_tenant: tenant.id,
        id_address: addressId,
        metodo_pagamento,
        troco,
        preco,
        subtotal,
        data_order: new Date(data_order),
        status,
        products: {
          create: products.map((product: any) => ({
            id_produto: product.id_produto,
            preco_produto: product.preco_produto,
            quantidade: product.quantidade,
          })),
        },
        statuses: {
          create: statuses.map((status: any) => ({
            status: status.status,
            created_at: new Date(status.created_at),
          })),
        },
      },
    });

    console.log("Pedido criado com sucesso:", newOrder);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: "Erro ao criar pedido", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { tenantSlug, orderId } = req.params; // ID do tenant e do pedido a ser atualizado
  const { status } = req.body; // Novo status fornecido na requisição

  console.log("Dados recebidos para atualização do status do pedido:", {
    tenantSlug,
    orderId,
    status,
  });

  try {
    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      console.log("Tenant não encontrado:", tenantSlug);
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    console.log("Tenant encontrado:", tenant);

    // Verificar se o pedido existe
    const orderExists = await prisma.order.findUnique({
      where: { id: Number(orderId), id_tenant: tenant.id },
    });

    if (!orderExists) {
      console.log("Pedido não encontrado:", orderId);
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    console.log("Pedido encontrado:", orderExists);

    // Atualizar o status do pedido
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: {
        status,
        statuses: {
          create: {
            status,
            created_at: new Date(),
          },
        },
      },
    });

    console.log("Status do pedido atualizado com sucesso:", updatedOrder);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Erro ao atualizar o status do pedido:", error);
    res
      .status(500)
      .json({ error: "Erro ao atualizar o status do pedido", details: error });
  } finally {
    await prisma.$disconnect();
  }
};
