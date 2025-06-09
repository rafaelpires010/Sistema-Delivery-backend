"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinSchema = void 0;
const zod_1 = require("zod");
exports.signinSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "Email é obrigatório" })
        .email({ message: "O email deve ser válido." }),
    senha: zod_1.z.string({ message: "Senha é obrigatória" }),
});
