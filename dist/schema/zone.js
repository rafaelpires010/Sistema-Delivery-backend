"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTenantZoneSchema = void 0;
const zod_1 = require("zod");
exports.updateTenantZoneSchema = zod_1.z.object({
    maxDistanceKm: zod_1.z.number().min(1).optional(),
    fixedfee: zod_1.z.number().min(1).optional(),
    additionalKmFee: zod_1.z.number().min(1).optional(),
    fixedDistanceKm: zod_1.z.number().min(1).optional(),
    tempoMaxEntre: zod_1.z.number().min(1).optional(),
});
