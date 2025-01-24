"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupSchema = void 0;
const zod_1 = require("zod");
const phoneRegex = /^\+?[0-9]{10,11}$/;
exports.signupSchema = zod_1.z.object({
    nome: zod_1.z
        .string({ message: "Nome é obrigatório" })
        .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
        .max(50, { message: "O nome deve ter no máximo 50 caracteres." }),
    telefone: zod_1.z.string({ message: "Telefone é obrigatório" }).regex(phoneRegex, {
        message: "Número de celular inválido. Deve conter 10 ou 11 dígitos.",
    }),
    email: zod_1.z
        .string({ message: "Email é obrigatório" })
        .email({ message: "O email deve ser válido." })
        .transform((email) => email.trim()), // Remove espaços ao redor, se houver
    senha: zod_1.z
        .string({ message: "Senha é obrigatória" })
        .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
        .max(30, { message: "A senha deve ter no máximo 30 caracteres." }),
});
