import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();
const GUEST_ORDER_SECRET =
  process.env.GUEST_ORDER_TOKEN_SECRET || "default_guest_secret";

interface SelectedComplement {
  id: number;
  product: {
    id: number;
    nome: string;
    preco: number;
  };
}

interface CartProduct {
  id: number;
  nome: string;
  preco: number;
  selectedComplements?: SelectedComplement[];
}

interface CartItem {
  product: CartProduct;
  qt: number;
}

interface OrderProduct {
  id_produto: number;
  nome_produto: string;
  preco_produto: number;
  quantidade: number;
  complementIds?: number[];
}

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
        user: {
          select: {
            nome: true,
            email: true,
            telefone: true,
          },
        },
        order_user: {
          select: {
            nome: true,
            email: true,
            telefone: true,
          },
        },
        orderAddress: {
          select: {
            rua: true,
            numero: true,
            cep: true,
            cidade: true,
            estado: true,
            bairro: true,
            complemento: true,
          },
        },
        formaPagamento: {
          select: {
            id: true,
            nome: true,
            tipo: true,
          },
        },
        products: {
          include: {
            complements: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        statuses: true,
        cupom: true,
      },
    });

    // Transforma os dados para sempre ter o campo user preenchido
    const transformedOrders = orders.map((order) => {
      const { order_user, ...rest } = order;
      return {
        ...rest,
        user: order.user || order_user,
      };
    });

    res.status(200).json(transformedOrders);
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
        cupom: true,
        formaPagamento: true,
        products: {
          include: {
            complements: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        statuses: true,
        orderAddress: true,
        user: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    res.status(500).json({ error: "Erro ao buscar pedido", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllOrdersByUserAndTenant = async (
  req: Request,
  res: Response
) => {
  const { tenantSlug } = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Token de autenticação não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, process.env.DEFAULT_TOKEN as string) as {
      id: number;
    };

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    const orders = await prisma.order.findMany({
      where: {
        id_user: decoded.id,
        id_tenant: tenant.id,
      },
      include: {
        cupom: true,
        formaPagamento: true,
        products: {
          include: {
            complements: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        statuses: true,
        orderAddress: true,
        user: true,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);

    if (error === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido." });
    }

    res.status(500).json({ error: "Erro ao buscar pedidos", details: error });
  } finally {
    await prisma.$disconnect();
  }
};

export const createOrder = async (req: Request, res: Response) => {
  const { tenantSlug } = req.params;
  const {
    address,
    paymentMethodId,
    changeFor,
    cupom, // cupom object or code
    cart,
    shippingValue,
    observacao,
    tempo_estimado,
    guestInfo,
    is_retirada,
  } = req.body as {
    address?: any; // address can have name/phone for guests
    paymentMethodId: number;
    changeFor: number;
    cupom: any;
    cart: CartItem[];
    shippingValue: number;
    observacao?: string;
    tempo_estimado: number;
    guestInfo?: { nome: string; email: string; telefone: string };
    is_retirada?: boolean;
  };

  const token = req.headers.authorization?.split(" ")[1];

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (!tenant) {
      return res.status(404).json({ error: "Tenant não encontrado." });
    }

    let user: { id: number; nome: string; telefone: string } | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.DEFAULT_TOKEN as string
        ) as { id: number };
        const userExists = await prisma.user.findUnique({
          where: { id: decoded.id },
        });
        if (userExists) {
          user = userExists;
        }
      } catch (error) {
        console.log("Token inválido, continuando como convidado.");
      }
    }

    if (
      !user &&
      (!guestInfo?.nome || !guestInfo?.email || !guestInfo?.telefone)
    ) {
      return res.status(400).json({
        error:
          "Nome, email e telefone são obrigatórios para pedidos de convidado.",
      });
    }

    if (!is_retirada && !address) {
      return res
        .status(400)
        .json({ error: "Endereço é obrigatório para pedidos de entrega." });
    }

    const formaPagamento = await prisma.formasPagamento.findFirst({
      where: { id: paymentMethodId, tenantId: tenant.id, ativo: true },
    });
    if (!formaPagamento) {
      return res
        .status(400)
        .json({ error: "Forma de pagamento inválida ou inativa." });
    }

    let calculatedSubtotal = 0;
    const orderProductsData = [];

    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.product.id, id_tenant: tenant.id },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Produto com ID ${item.product.id} não encontrado.` });
      }

      let itemPrice = item.product.preco;
      const selectedComplements = item.product.selectedComplements ?? [];

      if (selectedComplements.length > 0) {
        // Buscar os complementos
        const complements = await prisma.complement.findMany({
          where: {
            id: {
              in: selectedComplements.map((sc) => sc.id),
            },
          },
          include: {
            product: true,
          },
        });

        if (complements.length !== selectedComplements.length) {
          return res.status(400).json({
            error: "Um ou mais complementos selecionados são inválidos.",
            details: {
              complementosEncontrados: complements.length,
              complementosSolicitados: selectedComplements.length,
            },
          });
        }

        // Soma o preço dos produtos complementos
        const complementPrice = complements.reduce(
          (sum, complement) => sum + complement.product.preco,
          0
        );
        itemPrice += complementPrice;
      }

      calculatedSubtotal += itemPrice * item.qt;

      orderProductsData.push({
        nome_produto: item.product.nome,
        preco_produto: item.product.preco,
        quantidade: item.qt,
        product: {
          connect: { id: product.id },
        },
        complements: {
          connect: selectedComplements.map((sc) => ({ id: sc.id })),
        },
      });
    }

    let discount = 0;
    let cupomToUpdate: { id: number } | null = null;

    if (cupom && cupom.codigo) {
      const dbCupom = await prisma.cupons.findFirst({
        where: { codigo: cupom.codigo, tenantId: tenant.id, ativo: true },
      });

      if (!dbCupom) return res.status(400).json({ error: "Cupom inválido." });
      if (dbCupom.validade && dbCupom.validade < new Date())
        return res.status(400).json({ error: "Cupom expirado." });
      if (dbCupom.limiteUso && dbCupom.usosAtuais >= dbCupom.limiteUso)
        return res.status(400).json({ error: "Cupom esgotado." });
      if (dbCupom.valorMinimo && calculatedSubtotal < dbCupom.valorMinimo) {
        return res.status(400).json({
          error: `Pedido mínimo para este cupom é de R$ ${dbCupom.valorMinimo.toFixed(
            2
          )}`,
        });
      }

      if (dbCupom.tipoDesconto === "percentual") {
        discount = calculatedSubtotal * (dbCupom.desconto / 100);
      } else {
        discount = dbCupom.desconto;
      }
      cupomToUpdate = { id: dbCupom.id };
    }

    let finalPrice = calculatedSubtotal + shippingValue - discount;

    const orderCreateData: any = {
      id_tenant: tenant.id,
      id_user: user?.id,
      formaPagamentoId: paymentMethodId,
      troco: changeFor,
      shippingPrice: shippingValue,
      subtotal: calculatedSubtotal,
      preco: finalPrice,
      status: "received",
      origem: "DELIVERY",
      observacao,
      cupomId: cupomToUpdate?.id,
      tempo_estimado: tempo_estimado,
      is_retirada: is_retirada ?? false,
      products: {
        create: orderProductsData,
      },
      statuses: {
        create: {
          status: "received",
          created_at: new Date(),
        },
      },
    };

    if (!is_retirada && address) {
      orderCreateData.orderAddress = {
        create: {
          rua: address.rua,
          numero: address.numero,
          cep: address.cep,
          bairro: address.bairro,
          cidade: address.cidade,
          estado: address.estado,
          complemento: address.complemento,
        },
      };
    }

    if (!user && guestInfo) {
      orderCreateData.order_user = {
        create: {
          nome: guestInfo.nome,
          email: guestInfo.email,
          telefone: guestInfo.telefone,
        },
      };
    }

    const order = await prisma.order.create({
      data: orderCreateData,
      include: {
        products: {
          include: {
            complements: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        orderAddress: true,
        user: true,
        order_user: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        formaPagamento: true,
        cupom: true,
        statuses: true,
      },
    });

    let finalOrder = order;

    if (!user) {
      const token = randomBytes(8).toString("hex");
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      finalOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          guestToken: token,
          guestTokenExpiry: expiry,
        },
        include: {
          products: {
            include: {
              complements: {
                include: {
                  product: {
                    include: {
                      category: true,
                    },
                  },
                },
              },
              product: {
                include: {
                  category: true,
                },
              },
            },
          },
          orderAddress: true,
          user: true,
          order_user: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },
          formaPagamento: true,
          cupom: true,
          statuses: true,
        },
      });
    }

    if (cupomToUpdate) {
      await prisma.cupons.update({
        where: { id: cupomToUpdate.id },
        data: { usosAtuais: { increment: 1 } },
      });
    }

    const io = req.app.get("socketio");
    if (io) {
      const roomName = `tenant-${tenant.id}`;
      // Padroniza o campo user para sempre trazer os dados do cliente
      const { order_user, ...orderToSend } = {
        ...finalOrder,
        user: finalOrder.user || finalOrder.order_user || null,
      };
      console.log("📡 Emitindo evento new_order para sala:", roomName);
      console.log(
        "📦 Dados do pedido (enviados no websocket):",
        JSON.stringify(orderToSend, null, 2)
      );

      // Verificar se há sockets na sala
      const socketsInRoom = await io.in(roomName).fetchSockets();
      console.log(
        `👥 Número de sockets na sala ${roomName}:`,
        socketsInRoom.length
      );

      io.to(roomName).emit("new_order", orderToSend);

      console.log("✅ Evento new_order emitido com sucesso");
    } else {
      console.log("❌ Socket.IO não configurado, pulando emissão de evento.");
    }

    if (!user) {
      return res
        .status(201)
        .json({ ...finalOrder, guestToken: finalOrder.guestToken });
    }

    return res.status(201).json(finalOrder);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return res
      .status(500)
      .json({ error: "Erro ao criar pedido", details: error });
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

    const dataToUpdate: any = {
      status,
      statuses: {
        create: {
          status,
          created_at: new Date(),
        },
      },
    };

    if (status === "delivered") {
      dataToUpdate.dataHora_entrega = new Date();
    }
    // Atualizar o status do pedido
    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: dataToUpdate,
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

export const getGuestOrderByToken = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).json({ error: "Token não fornecido." });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { guestToken: token },
      include: {
        cupom: true,
        formaPagamento: true,
        products: {
          include: {
            complements: {
              include: {
                product: {
                  include: {
                    category: true,
                  },
                },
              },
            },
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        statuses: true,
        orderAddress: true,
        order_user: true,
        tenant: {
          select: {
            nome: true,
            img: true,
            slug: true,
            main_color: true,
            tenantInfo: {
              select: {
                telefone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Pedido não encontrado." });
    }

    if (
      !order.guestTokenExpiry ||
      new Date() > new Date(order.guestTokenExpiry)
    ) {
      return res.status(410).json({ error: "O link de acesso expirou." });
    }

    if (order.id_user) {
      return res
        .status(403)
        .json({ error: "Este pedido pertence a um usuário registrado." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido de convidado:", error);
    res.status(500).json({ error: "Erro ao buscar pedido", details: error });
  }
};
