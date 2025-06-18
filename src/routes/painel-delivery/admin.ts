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
  toggleProductStatus,
} from "../../controllers/productController";
import { verifyJWT } from "../../middlewares/jwt";
import {
  createCategory,
  deleteCategory,
  getCategoriesByTenant,
  getCategoryById,
  updateCategory,
  toggleCategoryStatus,
} from "../../controllers/categoriesController";
import upload from "../../middlewares/upload";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../../controllers/orderController";
import { authorizeRole } from "../../middlewares/hasRole";
import { authorizeClaim } from "../../middlewares/hasClaim";
import {
  addBanner,
  deleteBannerByID,
  getBannersByTenant,
} from "../../controllers/bannerController";
import {
  getCuponsByTenant,
  createCupom,
  updateCupom,
  deleteCupom,
  cupomToggleStatus,
} from "../../controllers/CuponsController";
import {
  createCampanha,
  deleteCampanha,
  getCampanhaById,
  getCampanhasByTenant,
  updateCampanha,
} from "../../controllers/campanhasController";
import {
  findUsersWithOrders,
  findUsersByLoggedUserTenants,
  createUser,
  toggleUserStatus,
  findUserById,
  findUserTenants,
} from "../../controllers/userController";
import {
  getAllClaims,
  getAllRoles,
} from "../../controllers/rolesClaimsController";
import { createVenda, cancelarVenda } from "../../controllers/vendasController";
import {
  getAllFormasPagamentoDelivery,
  getAllFormasPagamento,
  criarNovaFormaPagamento,
  editarFormaPagamento,
  deletarFormaPagamento,
  toggleFormaPagamentoStatus,
} from "../../controllers/formaPagamentoController";
import {
  alteraStatusVenda,
  confirmaVenda,
} from "../../controllers/vendasController";
import {
  getRelatorioByData,
  getResumoRelatorio,
  getDashboardData,
} from "../../controllers/relatorioProdutosController";

import {
  createComplementsGroup,
  getAllComplementsGroups,
  getComplementsGroupById,
  updateComplementsGroup,
  deleteComplementsGroup,
} from "../../controllers/complementsController";
import {
  linkComplementToGroup,
  unlinkComplementFromGroup,
  getLinkedProducts,
} from "../../controllers/complementController";

const router = Router();

//LOGIN

router.post("/signin", authTenant.signin);

//Rotas Tenant

router.get("/ping", (req, res) => res.json({ pong: true, admin: true }));

router.get("/:tenantSlug", verifyJWT, getTenantBySlug);

router.get("/user/tenants", verifyJWT, getAllTenantByUser);

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

router.put(
  "/:tenantSlug/categories/:categoryId/toggle-status",
  verifyJWT,
  toggleCategoryStatus
);

//Rotas Order

// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", verifyJWT, getAllOrders);

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

router.put(
  "/:tenantSlug/products/:productId/toggle-status",
  verifyJWT,
  toggleProductStatus
);

//Rotas Complements

// Rotas para grupos de complementos
router.post("/:tenantSlug/groups", verifyJWT, createComplementsGroup);
router.get("/:tenantSlug/groups", verifyJWT, getAllComplementsGroups);
router.get("/:tenantSlug/groups/:groupId", verifyJWT, getComplementsGroupById);
router.put("/:tenantSlug/groups/:groupId", verifyJWT, updateComplementsGroup);
router.delete(
  "/:tenantSlug/groups/:groupId",
  verifyJWT,
  deleteComplementsGroup
);

// Rotas para complementos
router.post("/:tenantSlug/complements/link", verifyJWT, linkComplementToGroup);
router.delete(
  "/:tenantSlug/complements/:complementsId/products/:productId",
  verifyJWT,
  unlinkComplementFromGroup
);
router.get(
  "/:tenantSlug/complements/:complementsId/products",
  getLinkedProducts
);

//Rotas Banner
router.post("/:tenantSlug/banners", upload.single("img"), addBanner, verifyJWT);

router.get("/:tenantSlug/banners", getBannersByTenant, verifyJWT);

router.delete("/:tenantSlug/banner/:bannerId", verifyJWT, deleteBannerByID);

//Rotas Cupom
router.get("/:tenantSlug/cupons", verifyJWT, getCuponsByTenant);
router.post("/:tenantSlug/cupons", verifyJWT, createCupom);
router.put("/:tenantSlug/cupons/:cupomId", verifyJWT, updateCupom);
router.delete("/:tenantSlug/cupons/:cupomId", verifyJWT, deleteCupom);
router.put(
  "/:tenantSlug/cupons/:cupomId/toggle-status",
  verifyJWT,
  cupomToggleStatus
);

//Rotas Campanhas
router.get("/:tenantSlug/campanhas", verifyJWT, getCampanhasByTenant);

router.post(
  "/:tenantSlug/campanhas",
  verifyJWT,
  upload.single("img"),
  createCampanha
);

router.put(
  "/:tenantSlug/campanhas/:campanhaId",
  verifyJWT,
  upload.single("img"),
  updateCampanha
);

router.delete("/:tenantSlug/campanhas/:campanhaId", verifyJWT, deleteCampanha);

router.get("/:tenantSlug/roles", verifyJWT, getAllRoles);
router.get("/:tenantSlug/claims", verifyJWT, getAllClaims);

//USERS
router.get("/user/tenants", verifyJWT, findUserTenants);
router.get("/user/:userId", verifyJWT, findUserById);
router.get("/:tenantSlug/users", verifyJWT, findUsersWithOrders);
router.get("/:tenantSlug/usersTenant", verifyJWT, findUsersByLoggedUserTenants);
router.post("/:tenantSlug/users", verifyJWT, createUser);
router.put("/users/:userId/toggle-status", verifyJWT, toggleUserStatus);

// Rotas Vendas
router.post("/:tenantSlug/vendas", verifyJWT, createVenda);
router.put("/:tenantSlug/vendas/:vendaId/status", verifyJWT, alteraStatusVenda);
router.put("/:tenantSlug/vendas/:orderId/confirmar", verifyJWT, confirmaVenda);
router.put("/:tenantSlug/vendas/:id/cancelar", verifyJWT, cancelarVenda);

// Rotas Relatórios
router.get("/:tenantSlug/relatorios", verifyJWT, getRelatorioByData);
router.get("/:tenantSlug/resumo-relatorio", verifyJWT, getResumoRelatorio);
router.get("/:tenantSlug/dashboard", verifyJWT, getDashboardData);

// Rotas Formas de Pagamento
router.get("/:tenantSlug/formas-pagamento", verifyJWT, getAllFormasPagamento);
router.post(
  "/:tenantSlug/formas-pagamento",
  verifyJWT,
  criarNovaFormaPagamento
);
router.put(
  "/:tenantSlug/formas-pagamento/:formaPagamentoId",
  verifyJWT,
  editarFormaPagamento
);
router.delete(
  "/:tenantSlug/formas-pagamento/:formaPagamentoId",
  verifyJWT,
  deletarFormaPagamento
);
router.put(
  "/:tenantSlug/formas-pagamento/:formaPagamentoId/toggle-status",
  verifyJWT,
  toggleFormaPagamentoStatus
);

export default router;
