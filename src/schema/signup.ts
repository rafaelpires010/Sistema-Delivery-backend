import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,11}$/;

export const signupSchema = z.object({
  nome: z
    .string({ message: "Nome é obrigatório" })
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres." })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres." }),
  telefone: z.string({ message: "Telefone é obrigatório" }).regex(phoneRegex, {
    message: "Número de celular inválido. Deve conter 10 ou 11 dígitos.",
  }),
  email: z
    .string({ message: "Email é obrigatório" })
    .email({ message: "O email deve ser válido." })
    .transform((email) => email.trim()), // Remove espaços ao redor, se houver
  senha: z
    .string({ message: "Senha é obrigatória" })
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .max(30, { message: "A senha deve ter no máximo 30 caracteres." }),
  admin: z.boolean().optional(),
});
