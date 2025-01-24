import { z } from "zod";

export const addressSchema = z.object({
  id_user: z.number().int(), // Deve ser um número inteiro (id do usuário)
  rua: z.string().min(1, "Rua é obrigatória"), // Valida que a rua seja uma string e não vazia
  numero: z.string().min(1, "Número é obrigatório"), // Valida que o número seja uma string e não vazio
  cep: z.string().min(1),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  id_cidade: z.number().int(),
  estado: z.string().min(2, "Estado deve ter no mínimo 2 caracteres"),
  complemento: z.string().optional(),
});
