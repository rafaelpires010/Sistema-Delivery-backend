import { Router } from "express";
import { getBannersByTenant } from "../controllers/bannerController";

const router = Router();

router.get("/:tenantSlug/banners", getBannersByTenant);

export default router;
