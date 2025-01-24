"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantInfosSchema = void 0;
const zod_1 = require("zod");
exports.updateTenantInfosSchema = zod_1.z.object({
    cnpj: zod_1.z.string().optional(),
    telefone: zod_1.z.string().optional(),
    whatsapp: zod_1.z.string().optional(),
    instagram: zod_1.z.string().optional(),
});
