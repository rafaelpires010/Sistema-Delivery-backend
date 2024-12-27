// routes/shippingRouter.ts

import express from "express";
import { calculateShippingHandler } from "../controllers/shipping";

const router = express.Router();

router.post("/calculate-shipping", calculateShippingHandler);

export default router;
