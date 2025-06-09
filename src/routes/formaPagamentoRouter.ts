import express from "express";
import { getAllFormasPagamentoDelivery } from "../controllers/formaPagamentoController";

const router = express.Router();

router.get("/:tenantSlug/formas-pagamento", getAllFormasPagamentoDelivery);

export default router;
