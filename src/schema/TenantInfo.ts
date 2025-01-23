import { z } from "zod";

export const updateTenantInfosSchema = z.object({
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
});
