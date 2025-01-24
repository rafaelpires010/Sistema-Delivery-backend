"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth = __importStar(require("../controllers/auth"));
const jwt_1 = require("../middlewares/jwt");
const teste_1 = require("../services/teste");
const router = (0, express_1.Router)();
router.get("/ping", (req, res) => res.json({ pong: true, admin: true }));
router.post("/signin", auth.signin);
router.post("/signup", auth.signup);
router.post("/authorize", jwt_1.verifyJWT, auth.authenticateUser);
router.post("/auth/request-password-reset", auth.requestPasswordReset);
router.post("/auth/reset-password", auth.resetPassword);
router.post("/auth/testeemail", teste_1.contato);
exports.default = router;
