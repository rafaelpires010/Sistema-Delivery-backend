import { z } from "zod";

export const updateTenantZoneSchema = z.object({
  maxDistanceKm: z.number().min(1).optional(),
  fixedfee: z.number().min(1).optional(),
  additionalKmFee: z.number().min(1).optional(),
  fixedDistanceKm: z.number().min(1).optional(),
  tempoMaxEntre: z.number().min(1).optional(),
});
