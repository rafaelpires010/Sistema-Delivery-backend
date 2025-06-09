"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const upload_1 = __importDefault(require("../middlewares/upload"));
const router = express_1.default.Router();
// Rota para obter produtos por slug do tenant
router.get("/:tenantSlug/products", productController_1.getProductsByTenantActive);
router.get("/:tenantSlug/products/:productId", productController_1.getProductById);
router.post("/:tenantSlug/products", upload_1.default.single("img"), productController_1.createProduct);
router.delete("/:tenantSlug/products/:productId", productController_1.deleteProduct);
//router.put(
//"/:tenantSlug/products/:productId",
//upload.single("img"),
//updateProduct
//);
exports.default = router;
