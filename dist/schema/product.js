"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório"),
    img: zod_1.z.string().url("Imagem deve ser uma URL válida"),
    id_category: zod_1.z
        .number()
        .int()
        .positive("ID da categoria deve ser um número positivo"),
    preco: zod_1.z.number().positive("Preço deve ser um valor positivo"),
    descricao: zod_1.z.string().optional(),
    id_tenant: zod_1.z.number().int().positive("ID do tenant é obrigatório"),
});
exports.updateProductSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1, "Nome é obrigatório").optional(),
    img: zod_1.z.string().url("Imagem deve ser uma URL válida").optional(),
    id_category: zod_1.z
        .number()
        .int()
        .positive("ID da categoria deve ser um número positivo")
        .optional(),
    preco: zod_1.z.number().positive("Preço deve ser um valor positivo").optional(),
    descricao: zod_1.z.string().optional(),
});
