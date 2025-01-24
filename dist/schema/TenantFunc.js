"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantFuncSchema = void 0;
const zod_1 = require("zod");
exports.updateTenantFuncSchema = zod_1.z.object({
    domClose: zod_1.z.string().min(4).optional(),
    domOpen: zod_1.z.string().min(4).optional(),
    terClose: zod_1.z.string().min(4).optional(),
    terOpen: zod_1.z.string().min(4).optional(),
    quarClose: zod_1.z.string().min(4).optional(),
    quarOpen: zod_1.z.string().min(4).optional(),
    quinClose: zod_1.z.string().min(4).optional(),
    quinOpen: zod_1.z.string().min(4).optional(),
    sexClose: zod_1.z.string().min(4).optional(),
    sexOpen: zod_1.z.string().min(4).optional(),
    sabClose: zod_1.z.string().min(4).optional(),
    sabOpen: zod_1.z.string().min(4).optional(),
    segClose: zod_1.z.string().min(4).optional(),
    segOpen: zod_1.z.string().min(4).optional(),
});
