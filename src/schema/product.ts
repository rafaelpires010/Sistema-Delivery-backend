import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  img: z.string().url("Imagem deve ser uma URL válida"),
  id_category: z
    .number()
    .int()
    .positive("ID da categoria deve ser um número positivo"),
  preco: z.number().positive("Preço deve ser um valor positivo"),
  descricao: z.string().optional(),
  id_tenant: z.number().int().positive("ID do tenant é obrigatório"),
});

export const updateProductSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  img: z.string().url("Imagem deve ser uma URL válida").optional(),
  id_category: z
    .number()
    .int()
    .positive("ID da categoria deve ser um número positivo")
    .optional(),
  preco: z.number().positive("Preço deve ser um valor positivo").optional(),
  descricao: z.string().optional(),
});
