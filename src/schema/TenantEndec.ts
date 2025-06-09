import { z } from "zod";

export const updateTenantEndecSchema = z.object({
  rua: z.string().optional(),
  cep: z.string().optional(),
  numero: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  bairro: z.string().optional(),
});
