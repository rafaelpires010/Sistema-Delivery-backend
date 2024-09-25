import { Router } from 'express';
import { getAddressByUser } from '../controllers/addressController';


const router = Router();

router.get('/:tenantSlug/address', getAddressByUser);

router.get('/:tenantSlug/categories/:categoryId',);

router.post('/:tenantSlug/categories',);

router.put('/:tenantSlug/categories/:categoryId', );

router.delete('/:tenantSlug/categories/:categoryId',);

export default router;
