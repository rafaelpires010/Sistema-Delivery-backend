import express from "express";
import {
  getProductsByTenantActive,
  getProductById,
  createProduct,
  deleteProduct,
} from "../controllers/productController";
import upload from "../middlewares/upload";

const router = express.Router();

// Rota para obter produtos por slug do tenant
router.get("/:tenantSlug/products", getProductsByTenantActive);

router.get("/:tenantSlug/products/:productId", getProductById);

router.post("/:tenantSlug/products", upload.single("img"), createProduct);

router.delete("/:tenantSlug/products/:productId", deleteProduct);

//router.put(
//"/:tenantSlug/products/:productId",
//upload.single("img"),
//updateProduct
//);

export default router;
