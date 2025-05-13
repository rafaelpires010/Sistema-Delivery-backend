"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vendasController_1 = require("../controllers/vendasController");
const router = express_1.default.Router();
//router.get("/:tenantSlug/vendas", getAllVendas);
router.post("/:tenantSlug/vendas", vendasController_1.createVenda);
exports.default = router;
