import express from 'express';
import { getProductsByTenant, getProductById, createProduct, deleteProduct, updateProduct } from '../controllers/productController';
import upload from '../middlewares/upload';

const router = express.Router();

// Rota para obter produtos por slug do tenant
router.get('/:tenantSlug/products', getProductsByTenant);

router.get('/:tenantSlug/products/:productId', getProductById);

router.post('/:tenantSlug/products', upload.single('img'), createProduct);

router.delete('/:tenantSlug/products/:productId', deleteProduct);

router.put('/:tenantSlug/products/:productId', upload.single('img'), updateProduct);

export default router;