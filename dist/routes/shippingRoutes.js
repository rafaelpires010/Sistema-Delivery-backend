"use strict";
// routes/shippingRouter.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shipping_1 = require("../controllers/shipping");
const router = express_1.default.Router();
router.post("/calculate-shipping", shipping_1.calculateShippingHandler);
exports.default = router;
