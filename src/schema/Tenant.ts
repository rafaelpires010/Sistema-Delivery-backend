import { z } from "zod";

export const updateTenantSchema = z.object({
  nome: z.string().optional(),
  main_color: z.string().optional(),
  second_color: z.string().optional(),
  img: z.string().optional(),
});
