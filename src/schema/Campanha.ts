import { z } from "zod";

export const createCampanhaSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  img: z.string(),
  cupomId: z.number().optional(),
  ativo: z.boolean(),
  tenantId: z.number(),
});

export const updateCampanhaSchema = z.object({
  nome: z.string(),
  descricao: z.string(),
  img: z.string(),
  cupomId: z.number().optional(),
  ativo: z.boolean().optional(),
});
