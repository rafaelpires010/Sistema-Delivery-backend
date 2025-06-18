import { Router } from "express";
import {
  linkComplementToGroup,
  unlinkComplementFromGroup,
  getLinkedProducts,
} from "../controllers/complementController";

const router = Router();

// Vincular produto a um grupo de complementos
router.post(
  "/:tenantSlug/complements/:complementsId/link",
  linkComplementToGroup
);

// Desvincular produto de um grupo de complementos
router.delete(
  "/:tenantSlug/complements/:complementsId/products/:productId",
  unlinkComplementFromGroup
);

// Listar produtos vinculados a um grupo
router.get(
  "/:tenantSlug/complements/:complementsId/products",
  getLinkedProducts
);

export default router;
