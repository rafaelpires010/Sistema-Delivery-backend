"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authTenant = __importStar(require("../../controllers/authTenant"));
const tenantController_1 = require("../../controllers/tenantController");
const productController_1 = require("../../controllers/productController");
const jwt_1 = require("../../middlewares/jwt");
const categoriesController_1 = require("../../controllers/categoriesController");
const upload_1 = __importDefault(require("../../middlewares/upload"));
const orderController_1 = require("../../controllers/orderController");
const hasRole_1 = require("../../middlewares/hasRole");
const bannerController_1 = require("../../controllers/bannerController");
const CuponsController_1 = require("../../controllers/CuponsController");
const router = (0, express_1.Router)();
//LOGIN
router.post("/signin", authTenant.signin);
//Rotas Tenant
router.get("/ping", (req, res) => res.json({ pong: true, admin: true }));
router.get("/:tenantSlug", jwt_1.verifyJWT, tenantController_1.getTenantBySlug);
router.get("/user/tenants", tenantController_1.getAllTenantByUser);
router.get("/:tenantSlug/products", jwt_1.verifyJWT, productController_1.getProductsByTenant);
router.get("/:tenantSlug/products/:productId", jwt_1.verifyJWT, productController_1.getProductById);
router.get("/:tenantSlug/toggleOpenClose", jwt_1.verifyJWT, tenantController_1.getTenantOpenClose);
router.post("/:tenantSlug/toggleOpenClose", jwt_1.verifyJWT, tenantController_1.setTenantOpenClose);
//edição do layout
router.put("/:tenantSlug/layout/:tenantId", upload_1.default.single("img"), tenantController_1.updateTenantLayout, jwt_1.verifyJWT);
//edição das Informações
router.put("/:tenantSlug/infos/:tenantId", tenantController_1.updateTenantInfos, jwt_1.verifyJWT);
//edição das Zonas de entrega
router.put("/:tenantSlug/zones/:tenantId", tenantController_1.updateTenantZone, jwt_1.verifyJWT);
//edição dos horarios de funcionamento
router.put("/:tenantSlug/funcionamento/:tenantId", tenantController_1.updateTenantFunc, jwt_1.verifyJWT);
//edição do endereço
router.put("/:tenantSlug/endereco/:tenantId", tenantController_1.updateTenantEnder, jwt_1.verifyJWT);
//Rotas Categorias
router.get("/:tenantSlug/categories", jwt_1.verifyJWT, categoriesController_1.getCategoriesByTenant);
router.get("/:tenantSlug/categories/:categoryId", jwt_1.verifyJWT, categoriesController_1.getCategoryById);
router.post("/:tenantSlug/categories", upload_1.default.single("img"), jwt_1.verifyJWT, categoriesController_1.createCategory);
router.put("/:tenantSlug/categories/:categoryId", upload_1.default.single("img"), categoriesController_1.updateCategory, jwt_1.verifyJWT);
router.delete("/:tenantSlug/categories/:categoryId", jwt_1.verifyJWT, categoriesController_1.deleteCategory);
//Rotas Order
// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", jwt_1.verifyJWT, (0, hasRole_1.authorizeRole)("admin"), orderController_1.getAllOrders);
// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/order", jwt_1.verifyJWT, orderController_1.createOrder);
// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", jwt_1.verifyJWT, orderController_1.getOrderById);
// Rota para atualizar o status de um pedido específico
router.put("/:tenantSlug/order/status/:orderId", jwt_1.verifyJWT, orderController_1.updateOrderStatus);
//Rotas Products
router.get("/:tenantSlug/products", jwt_1.verifyJWT, productController_1.getProductsByTenant);
router.get("/:tenantSlug/products/:productId", jwt_1.verifyJWT, productController_1.getProductById);
router.post("/:tenantSlug/products", upload_1.default.single("img"), jwt_1.verifyJWT, productController_1.createProduct);
router.delete("/:tenantSlug/products/:productId", jwt_1.verifyJWT, productController_1.deleteProduct);
router.put("/:tenantSlug/products/:productId", upload_1.default.single("img"), productController_1.updateProduct, jwt_1.verifyJWT);
//Rotas Banner
router.post("/:tenantSlug/banners", upload_1.default.single("img"), bannerController_1.addBanner, jwt_1.verifyJWT);
router.get("/:tenantSlug/banners", bannerController_1.getBannersByTenant, jwt_1.verifyJWT);
router.delete("/:tenantSlug/banner/:bannerId", jwt_1.verifyJWT, bannerController_1.deleteBannerByID);
//Rotas Cupom
router.get("/:tenantSlug/cupons", jwt_1.verifyJWT, CuponsController_1.getCuponsByTenant);
exports.default = router;
