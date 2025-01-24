"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantController_1 = require("../controllers/tenantController");
const router = (0, express_1.Router)();
router.get("/:tenantSlug", tenantController_1.getTenantBySlug);
router.get("/:tenantSlug/toggleOpenClose", tenantController_1.getTenantOpenClose);
//router.post("/:tenantSlug/toggleOpenClose", setTenantOpenClose);
exports.default = router;
