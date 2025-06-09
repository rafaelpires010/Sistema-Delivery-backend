"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.gerarToken = exports.createJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../services/user");
const createJWT = (email) => {
    return jsonwebtoken_1.default.sign({ email }, process.env.DEFAULT_TOKEN);
};
exports.createJWT = createJWT;
const gerarToken = (email, id) => {
    return jsonwebtoken_1.default.sign({ email, id }, process.env.DEFAULT_TOKEN);
};
exports.gerarToken = gerarToken;
const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
        return res.status(401).json({ error: "Acesso negado" });
    const token = authHeader.split(" ")[1];
    jsonwebtoken_1.default.verify(token, process.env.DEFAULT_TOKEN, async (error, decoded) => {
        if (error)
            return res.status(401).json({ error: "Acesso negado" });
        const user = await (0, user_1.findUserByEmail)(decoded.email);
        if (!user)
            return res.status(401).json({ error: "Acesso negado" });
        req.user = user;
        next();
    });
};
exports.verifyJWT = verifyJWT;
