import { z } from "zod";

export const updateTenantInfosSchema = z.object({
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
});

export const createTenantInfoSchema = z.object({
  cnpj: z.string({ required_error: "O CNPJ é obrigatório." }),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  cep: z.string({ required_error: "O CEP é obrigatório." }),
  rua: z.string({ required_error: "A rua é obrigatória." }),
  numero: z.string({ required_error: "O número é obrigatório." }),
  cidade: z.string({ required_error: "A cidade é obrigatória." }),
  estado: z.string({ required_error: "O estado é obrigatório." }),
  bairro: z.string({ required_error: "O bairro é obrigatório." }),
  instagram: z.string().optional(),
});
