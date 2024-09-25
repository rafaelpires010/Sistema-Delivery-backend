import { Router } from 'express';
import { getTenantBySlug } from '../controllers/tenantController';

const router = Router();

router.get('/:tenantSlug', getTenantBySlug);

export default router;
