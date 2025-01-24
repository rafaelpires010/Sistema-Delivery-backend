"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getAllOrdersByUserAndTenant = exports.getOrderById = exports.getAllOrders = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const getAllOrders = async (req, res) => {
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
                    },
                },
                address: {
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
                products: {
                    select: {
                        id_produto: true,
                        preco_produto: true,
                        quantidade: true,
                        nome_produto: true,
                    },
                },
                statuses: true,
            },
        });
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        res.status(500).json({ error: "Erro ao buscar pedidos", details: error });
    }
};
exports.getAllOrders = getAllOrders;
const getOrderById = async (req, res) => {
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
                        bairro: true,
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
        res.status(200).json(order);
    }
    catch (error) {
        console.error("Erro ao buscar pedido:", error);
        res.status(500).json({ error: "Erro ao buscar pedido", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getOrderById = getOrderById;
const getAllOrdersByUserAndTenant = async (req, res) => {
    const { tenantSlug } = req.params; // Recebe o slug do tenant como parâmetro
    const token = req.headers.authorization?.split(" ")[1]; // Extrai o token do cabeçalho Authorization
    if (!token) {
        return res
            .status(401)
            .json({ error: "Token de autenticação não fornecido." });
    }
    try {
        // Verifica e decodifica o token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN);
        // Busca o tenant pelo slug
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        console.log("User: " + decoded.id);
        // Busca todos os pedidos do usuário especificado no tenant especificado
        const orders = await prisma.order.findMany({
            where: {
                id_user: decoded.id, // Utiliza o id_user obtido do token
                id_tenant: tenant.id, // Filtra pelo tenant_id
            },
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
                        bairro: true,
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
        res.status(200).json(orders);
    }
    catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        if (error === "JsonWebTokenError") {
            return res.status(401).json({ error: "Token inválido." });
        }
        res.status(500).json({ error: "Erro ao buscar pedidos", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.getAllOrdersByUserAndTenant = getAllOrdersByUserAndTenant;
const createOrder = async (req, res) => {
    const { tenantSlug } = req.params;
    const { id_user, id_address, metodo_pagamento, troco, preco, subtotal, data_order, status, products, statuses, shippingPrice, } = req.body;
    try {
        // Verifica se o tenant existe
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantSlug },
        });
        if (!tenant) {
            return res.status(404).json({ error: "Tenant não encontrado." });
        }
        // Verifica se o usuário existe
        const userId = id_user;
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!userExists) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        // Verifica se o endereço existe
        const addressId = id_address;
        const addressExists = await prisma.user_Address.findUnique({
            where: { id: addressId },
        });
        if (!addressExists) {
            return res.status(404).json({ error: "Endereço não encontrado." });
        }
        // Verifica se todos os produtos existem
        const productIds = products.map((product) => product.id_produto);
        const productsExist = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const existingProductIds = productsExist.map((product) => product.id);
        const invalidProducts = productIds.filter((id) => !existingProductIds.includes(id));
        if (invalidProducts.length > 0) {
            return res
                .status(404)
                .json({ error: "Um ou mais produtos não encontrados." });
        }
        // Cria o novo pedido
        const newOrder = await prisma.order.create({
            data: {
                id_user: userId,
                id_tenant: tenant.id,
                id_address: addressId,
                metodo_pagamento,
                troco,
                preco,
                subtotal,
                data_order: new Date(data_order), // Certifique-se de que data_order está em um formato válido
                status,
                shippingPrice,
                products: {
                    create: products.map((product) => ({
                        id_produto: product.id_produto,
                        preco_produto: product.preco_produto,
                        nome_produto: product.nome_produto,
                        quantidade: product.quantidade,
                    })),
                },
                statuses: {
                    create: statuses.map((status) => ({
                        status: status.status,
                        created_at: new Date(status.created_at), // Certifique-se de que status.created_at está em um formato válido
                    })),
                },
            },
        });
        // Emitir evento via socket
        const io = req.app.get("socketio");
        console.log("Emitindo novo pedido:", newOrder);
        // Inclui os produtos e statuses no evento emitido
        const orderData = {
            ...newOrder,
            user: {
                nome: "Atualizar página",
            },
            products: products.map((product) => ({
                id_produto: product.id_produto,
                preco_produto: product.preco_produto,
                nome_produto: product.nome_produto,
                quantidade: product.quantidade,
            })),
            statuses: statuses.map((status) => ({
                status: status.status,
                created_at: new Date(status.created_at), // Certifique-se de que status.created_at está em um formato válido
            })),
        };
        io.emit("newOrder", orderData);
        return res.status(201).json(newOrder);
    }
    catch (error) {
        console.error("Erro ao criar pedido:", error);
        return res
            .status(500)
            .json({ error: "Erro ao criar pedido", details: error });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
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
    }
    catch (error) {
        console.error("Erro ao atualizar o status do pedido:", error);
        res
            .status(500)
            .json({ error: "Erro ao atualizar o status do pedido", details: error });
    }
    finally {
        await prisma.$disconnect();
    }
};
exports.updateOrderStatus = updateOrderStatus;
