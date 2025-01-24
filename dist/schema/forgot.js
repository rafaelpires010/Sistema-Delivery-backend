"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = void 0;
const zod_1 = require("zod");
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().nonempty("Token é obrigatório"),
    newPassword: zod_1.z
        .string()
        .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});
