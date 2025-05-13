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
const hasClaim_1 = require("../../middlewares/hasClaim");
const bannerController_1 = require("../../controllers/bannerController");
const CuponsController_1 = require("../../controllers/CuponsController");
const campanhasController_1 = require("../../controllers/campanhasController");
const userController_1 = require("../../controllers/userController");
const rolesClaimsController_1 = require("../../controllers/rolesClaimsController");
const pdvController_1 = require("../../controllers/pdvController");
const vendasController_1 = require("../../controllers/vendasController");
const formaPagamentoController_1 = require("../../controllers/formaPagamentoController");
const vendasController_2 = require("../../controllers/vendasController");
const relatorioVendasController_1 = require("../../controllers/relatorioVendasController");
const relatorioProdutosController_1 = require("../../controllers/relatorioProdutosController");
const verifyOperador_1 = require("../../middlewares/verifyOperador");
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
router.put("/:tenantSlug/categories/:categoryId/toggle-status", jwt_1.verifyJWT, categoriesController_1.toggleCategoryStatus);
//Rotas Order
// Rota para obter todos os pedidos de um tenant específico
router.get("/:tenantSlug/orders", jwt_1.verifyJWT, (0, hasRole_1.authorizeRole)("DFGD98G87DHG897FD"), orderController_1.getAllOrders);
// Rota para criar um novo pedido para um tenant específico
router.post("/:tenantSlug/order", jwt_1.verifyJWT, orderController_1.createOrder);
// Rota para obter um pedido do tenant.
router.get("/:tenantSlug/order/:id", jwt_1.verifyJWT, orderController_1.getOrderById);
// Rota para atualizar o status de um pedido específico
router.put("/:tenantSlug/order/status/:orderId", jwt_1.verifyJWT, (0, hasClaim_1.authorizeClaim)("HFDS7S87FGS8943WHJOWEGO"), orderController_1.updateOrderStatus);
//Rotas Products
router.get("/:tenantSlug/products", jwt_1.verifyJWT, productController_1.getProductsByTenant);
router.get("/:tenantSlug/products/:productId", jwt_1.verifyJWT, productController_1.getProductById);
router.post("/:tenantSlug/products", upload_1.default.single("img"), jwt_1.verifyJWT, productController_1.createProduct);
router.delete("/:tenantSlug/products/:productId", jwt_1.verifyJWT, productController_1.deleteProduct);
router.put("/:tenantSlug/products/:productId", upload_1.default.single("img"), productController_1.updateProduct, jwt_1.verifyJWT);
router.put("/:tenantSlug/products/:productId/toggle-status", jwt_1.verifyJWT, productController_1.toggleProductStatus);
//Rotas Banner
router.post("/:tenantSlug/banners", upload_1.default.single("img"), bannerController_1.addBanner, jwt_1.verifyJWT);
router.get("/:tenantSlug/banners", bannerController_1.getBannersByTenant, jwt_1.verifyJWT);
router.delete("/:tenantSlug/banner/:bannerId", jwt_1.verifyJWT, bannerController_1.deleteBannerByID);
//Rotas Cupom
router.get("/:tenantSlug/cupons", jwt_1.verifyJWT, CuponsController_1.getCuponsByTenant);
router.post("/:tenantSlug/cupons", jwt_1.verifyJWT, CuponsController_1.createCupom);
router.put("/:tenantSlug/cupons/:cupomId", jwt_1.verifyJWT, CuponsController_1.updateCupom);
router.delete("/:tenantSlug/cupons/:cupomId", jwt_1.verifyJWT, CuponsController_1.deleteCupom);
router.put("/:tenantSlug/cupons/:cupomId/toggle-status", jwt_1.verifyJWT, CuponsController_1.cupomToggleStatus);
//Rotas Campanhas
router.get("/:tenantSlug/campanhas", jwt_1.verifyJWT, campanhasController_1.getCampanhasByTenant);
router.post("/:tenantSlug/campanhas", jwt_1.verifyJWT, upload_1.default.single("img"), campanhasController_1.createCampanha);
router.put("/:tenantSlug/campanhas/:campanhaId", jwt_1.verifyJWT, upload_1.default.single("img"), campanhasController_1.updateCampanha);
router.delete("/:tenantSlug/campanhas/:campanhaId", jwt_1.verifyJWT, campanhasController_1.deleteCampanha);
router.get("/:tenantSlug/roles", jwt_1.verifyJWT, rolesClaimsController_1.getAllRoles);
router.get("/:tenantSlug/claims", jwt_1.verifyJWT, rolesClaimsController_1.getAllClaims);
//USERS
router.get("/user/tenants", jwt_1.verifyJWT, userController_1.findUserTenants);
router.get("/user/:userId", jwt_1.verifyJWT, userController_1.findUserById);
router.get("/:tenantSlug/users", jwt_1.verifyJWT, userController_1.findUsersWithOrders);
router.get("/:tenantSlug/usersTenant", jwt_1.verifyJWT, userController_1.findUsersByLoggedUserTenants);
router.post("/:tenantSlug/users", jwt_1.verifyJWT, userController_1.createUser);
router.put("/users/:userId/toggle-status", jwt_1.verifyJWT, userController_1.toggleUserStatus);
// Rotas PDV
router.get("/:tenantSlug/pdvs", jwt_1.verifyJWT, pdvController_1.getAllPdvs);
router.post("/:tenantSlug/pdv/create", jwt_1.verifyJWT, pdvController_1.createPdv);
router.post("/:tenantSlug/pdv/caixa/abrir", jwt_1.verifyJWT, verifyOperador_1.verifyOperador, pdvController_1.abrirCaixa);
router.post("/:tenantSlug/pdv/caixa/fechar", jwt_1.verifyJWT, pdvController_1.fecharCaixa);
router.post("/:tenantSlug/pdv/caixa/sangria", pdvController_1.registrarSangria);
router.post("/:tenantSlug/pdv/caixa/suprimento", pdvController_1.registrarSuprimento);
router.post("/:tenantSlug/pdv/caixa/atual", jwt_1.verifyJWT, pdvController_1.getCaixaAtual);
router.post("/:tenantSlug/pdv/registrar-order", jwt_1.verifyJWT, pdvController_1.registrarOrderAndVendaPdv);
router.post("/:tenantSlug/pdv/trocar-operador", jwt_1.verifyJWT, pdvController_1.trocarOperador);
router.post("/:tenantSlug/pdv/cancelar-venda", jwt_1.verifyJWT, pdvController_1.cancelarVendaPdv);
router.post("/:tenantSlug/pdv/cancelar-ultima-venda", jwt_1.verifyJWT, pdvController_1.cancelarUltimaVendaPdv);
router.post("/:tenantSlug/pdv/reimprimir-ultimo-cupom", jwt_1.verifyJWT, pdvController_1.reimprimirUltimoCupom);
router.post("/:tenantSlug/pdv/reimprimir-cupom", jwt_1.verifyJWT, pdvController_1.reimprimirCupomEspecifico);
// Rotas Vendas
router.post("/:tenantSlug/vendas", jwt_1.verifyJWT, vendasController_1.createVenda);
router.put("/:tenantSlug/vendas/:vendaId/status", jwt_1.verifyJWT, vendasController_2.alteraStatusVenda);
router.put("/:tenantSlug/vendas/:orderId/confirmar", jwt_1.verifyJWT, vendasController_2.confirmaVenda);
router.put("/:tenantSlug/vendas/:id/cancelar", jwt_1.verifyJWT, vendasController_1.cancelarVenda);
// Rotas Relatórios
router.get("/:tenantSlug/relatorios/vendas", jwt_1.verifyJWT, relatorioVendasController_1.getAllVendasByData);
router.get("/:tenantSlug/relatorios/produtos", jwt_1.verifyJWT, relatorioProdutosController_1.getAllProdutosByData);
// Rotas Formas de Pagamento
router.get("/:tenantSlug/formas-pagamento", jwt_1.verifyJWT, formaPagamentoController_1.getAllFormasPagamento);
router.post("/:tenantSlug/formas-pagamento", jwt_1.verifyJWT, formaPagamentoController_1.criarNovaFormaPagamento);
router.put("/:tenantSlug/formas-pagamento/:formaPagamentoId", jwt_1.verifyJWT, formaPagamentoController_1.editarFormaPagamento);
router.delete("/:tenantSlug/formas-pagamento/:formaPagamentoId", jwt_1.verifyJWT, formaPagamentoController_1.deletarFormaPagamento);
router.put("/:tenantSlug/formas-pagamento/:formaPagamentoId/toggle-status", jwt_1.verifyJWT, formaPagamentoController_1.toggleFormaPagamentoStatus);
exports.default = router;
