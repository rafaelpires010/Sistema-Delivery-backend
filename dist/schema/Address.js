"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    id_user: zod_1.z.number().int(), // Deve ser um número inteiro (id do usuário)
    rua: zod_1.z.string().min(1, "Rua é obrigatória"), // Valida que a rua seja uma string e não vazia
    numero: zod_1.z.string().min(1, "Número é obrigatório"), // Valida que o número seja uma string e não vazio
    cep: zod_1.z.string().min(1),
    cidade: zod_1.z.string().min(1, "Cidade é obrigatória"),
    bairro: zod_1.z.string().min(1, "Bairro é obrigatório"),
    id_cidade: zod_1.z.number().int(),
    estado: zod_1.z.string().min(2, "Estado deve ter no mínimo 2 caracteres"),
    complemento: zod_1.z.string().optional(),
});
