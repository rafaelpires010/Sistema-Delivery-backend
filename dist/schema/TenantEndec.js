"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantEndecSchema = void 0;
const zod_1 = require("zod");
exports.updateTenantEndecSchema = zod_1.z.object({
    rua: zod_1.z.string().optional(),
    cep: zod_1.z.string().optional(),
    numero: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    estado: zod_1.z.string().optional(),
    bairro: zod_1.z.string().optional(),
});
