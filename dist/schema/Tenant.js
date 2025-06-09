"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantSchema = void 0;
const zod_1 = require("zod");
exports.updateTenantSchema = zod_1.z.object({
    nome: zod_1.z.string().optional(),
    main_color: zod_1.z.string().optional(),
    second_color: zod_1.z.string().optional(),
    img: zod_1.z.string().optional(),
});
