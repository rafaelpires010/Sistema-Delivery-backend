import express from "express";
import { createVenda } from "../controllers/vendasController";

const router = express.Router();

//router.get("/:tenantSlug/vendas", getAllVendas);
router.post("/:tenantSlug/vendas", createVenda);

export default router;
