import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrderById,
  getAllOrdersByUserAndTenant,
  getGuestOrderByToken,
  updateOrderStatus,
} from "../controllers/orderController";
import { verifyJWT } from "../middlewares/jwt";

const router = express.Router();

// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", verifyJWT, getAllOrders);

router.get("/:tenantSlug/user/orders", verifyJWT, getAllOrdersByUserAndTenant);

router.get("/:tenantSlug/guest-order", getGuestOrderByToken);

// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", verifyJWT, getOrderById);

// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/orders", createOrder);

// Rota para atualizar o status de um pedido
router.put("/:tenantSlug/orders/:orderId/status", updateOrderStatus);

export default router;
