import { Router } from "express";
import * as auth from '../controllers/auth'
import { getTenantBySlug } from '../controllers/tenantController';
import { getProductById, getProductsByTenant } from "../controllers/productController";

const router = Router();

router.get('/ping', auth.validate, (req, res) => res.json({ pong: true, admin: true }));

router.post('/login', auth.login);

router.get('/:tenantSlug', getTenantBySlug);

router.get('/:tenantSlug/products', getProductsByTenant);

router.get('/:tenantSlug/products/:productId', getProductById);

export default router;