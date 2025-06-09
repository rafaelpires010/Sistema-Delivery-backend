import { Router } from "express";
import {
  getTenantBySlug,
  getTenantOpenClose,
  setTenantOpenClose,
} from "../controllers/tenantController";
import * as auth from "../controllers/auth";

const router = Router();

router.get("/:tenantSlug", getTenantBySlug);

router.get("/:tenantSlug/toggleOpenClose", getTenantOpenClose);

//router.post("/:tenantSlug/toggleOpenClose", setTenantOpenClose);

export default router;
