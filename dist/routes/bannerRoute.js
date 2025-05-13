"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bannerController_1 = require("../controllers/bannerController");
const router = (0, express_1.Router)();
router.get("/:tenantSlug/banners", bannerController_1.getBannersByTenant);
exports.default = router;
