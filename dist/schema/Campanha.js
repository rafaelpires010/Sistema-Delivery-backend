"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampanhaSchema = exports.createCampanhaSchema = void 0;
const zod_1 = require("zod");
exports.createCampanhaSchema = zod_1.z.object({
    nome: zod_1.z.string(),
    descricao: zod_1.z.string(),
    img: zod_1.z.string(),
    cupomId: zod_1.z.number().optional(),
    ativo: zod_1.z.boolean(),
    tenantId: zod_1.z.number(),
});
exports.updateCampanhaSchema = zod_1.z.object({
    nome: zod_1.z.string(),
    descricao: zod_1.z.string(),
    img: zod_1.z.string(),
    cupomId: zod_1.z.number().optional(),
    ativo: zod_1.z.boolean().optional(),
});
