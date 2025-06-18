import express from "express";
import { validateCupom } from "../controllers/CuponsController";

const router = express.Router();

router.post("/:tenantSlug/cupomValidate/:codigo", validateCupom);

export default router;
