import { Router } from "express";
import * as authTenant from "../../controllers/authTenant";
import {
  getAllTenantByUser,
  getTenantBySlug,
  getTenantOpenClose,
  setTenantOpenClose,
} from "../../controllers/tenantController";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductsByTenant,
  updateProduct,
} from "../../controllers/productController";
import { verifyJWT } from "../../middlewares/jwt";
import {
  createCategory,
  deleteCategory,
  getCategoriesByTenant,
  getCategoryById,
  updateCategory,
} from "../../controllers/categoriesController";
import upload from "../../middlewares/upload";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../../controllers/orderController";
import { authorizeRole } from "../../middlewares/hasRole";
import {
  addBanner,
  getBannersByTenant,
} from "../../controllers/bannerController";

const router = Router();

//LOGIN

router.post("/signin", authTenant.signin);

//Rotas Tenant

router.get("/ping", (req, res) => res.json({ pong: true, admin: true }));

router.get("/:tenantSlug", verifyJWT, getTenantBySlug);

router.get("/user/tenants", getAllTenantByUser);

router.get("/:tenantSlug/products", verifyJWT, getProductsByTenant);

router.get("/:tenantSlug/products/:productId", verifyJWT, getProductById);

router.get("/:tenantSlug/toggleOpenClose", verifyJWT, getTenantOpenClose);

router.post("/:tenantSlug/toggleOpenClose", verifyJWT, setTenantOpenClose);

//Rotas Categorias

router.get("/:tenantSlug/categories", verifyJWT, getCategoriesByTenant);

router.get("/:tenantSlug/categories/:categoryId", verifyJWT, getCategoryById);

router.post(
  "/:tenantSlug/categories",
  upload.single("img"),
  verifyJWT,
  createCategory
);

router.put(
  "/:tenantSlug/categories/:categoryId",
  upload.single("img"),
  updateCategory,
  verifyJWT
);

router.delete("/:tenantSlug/categories/:categoryId", verifyJWT, deleteCategory);

//Rotas Order

// Rota para obter todos os pedidos de um tenant específico
router.get(
  "/:tenantSlug/orders",
  verifyJWT,
  authorizeRole("admin"),
  getAllOrders
);

// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/order", verifyJWT, createOrder);

// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", verifyJWT, getOrderById);

// Rota para atualizar o status de um pedido específico
router.put("/:tenantSlug/order/status/:orderId", verifyJWT, updateOrderStatus);

//Rotas Products

router.get("/:tenantSlug/products", verifyJWT, getProductsByTenant);

router.get("/:tenantSlug/products/:productId", verifyJWT, getProductById);

router.post(
  "/:tenantSlug/products",
  upload.single("img"),
  verifyJWT,
  createProduct
);

router.delete("/:tenantSlug/products/:productId", verifyJWT, deleteProduct);

router.put(
  "/:tenantSlug/products/:productId",
  upload.single("img"),
  updateProduct,
  verifyJWT
);

//Rotas Banner
router.post("/:tenantSlug/banners", upload.single("img"), addBanner, verifyJWT);

router.get("/:tenantSlug/banners", getBannersByTenant, verifyJWT);

export default router;
