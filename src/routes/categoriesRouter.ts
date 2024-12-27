import { Router } from "express";
import {
  getCategoriesByTenant,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoriesController";
import upload from "../middlewares/upload";

const router = Router();

router.get("/:tenantSlug/categories", getCategoriesByTenant);

router.get("/:tenantSlug/categories/:categoryId", getCategoryById);

//router.post('/:tenantSlug/categories', upload.none(), createCategory);

//router.put('/:tenantSlug/categories/:categoryId', upload.none(), updateCategory);

//router.delete('/:tenantSlug/categories/:categoryId', deleteCategory);

export default router;
