import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController";

const router = express.Router();

// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", getAllOrders);

// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/order", createOrder);

// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", getOrderById);

// Rota para atualizar o status de um pedido específico
router.put("/:tenantSlug/order/status/:orderId", updateOrderStatus);
export default router;
