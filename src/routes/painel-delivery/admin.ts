import { Router } from "express";
import * as authTenant from "../../controllers/authTenant";
import {
  getAllTenantByUser,
  getTenantBySlug,
  getTenantOpenClose,
  setTenantOpenClose,
  updateTenantEnder,
  updateTenantFunc,
  updateTenantInfos,
  updateTenantLayout,
  updateTenantZone,
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
  deleteBannerByID,
  getBannersByTenant,
} from "../../controllers/bannerController";
import { getCuponsByTenant } from "../../controllers/CuponsController";

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

//edição do layout
router.put(
  "/:tenantSlug/layout/:tenantId",
  upload.single("img"),
  updateTenantLayout,
  verifyJWT
);

//edição das Informações
router.put("/:tenantSlug/infos/:tenantId", updateTenantInfos, verifyJWT);

//edição das Zonas de entrega
router.put("/:tenantSlug/zones/:tenantId", updateTenantZone, verifyJWT);

//edição dos horarios de funcionamento
router.put("/:tenantSlug/funcionamento/:tenantId", updateTenantFunc, verifyJWT);

//edição do endereço
router.put("/:tenantSlug/endereco/:tenantId", updateTenantEnder, verifyJWT);

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

router.delete("/:tenantSlug/banner/:bannerId", verifyJWT, deleteBannerByID);

//Rotas Cupom
router.get("/:tenantSlug/cupons", verifyJWT, getCuponsByTenant);

export default router;
