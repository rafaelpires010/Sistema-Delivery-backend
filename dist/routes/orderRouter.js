"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const jwt_1 = require("../middlewares/jwt");
const router = express_1.default.Router();
// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", orderController_1.getAllOrders);
router.get("/:tenantSlug/user/orders", jwt_1.verifyJWT, orderController_1.getAllOrdersByUserAndTenant);
// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/order", orderController_1.createOrder);
// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", orderController_1.getOrderById);
// Rota para atualizar o status de um pedido específico
//router.put("/:tenantSlug/order/status/:orderId", updateOrderStatus);
exports.default = router;
