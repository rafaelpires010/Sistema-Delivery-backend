import { z } from "zod";

export const resetPasswordSchema = z.object({
  token: z.string().nonempty("Token é obrigatório"),
  newPassword: z
    .string()
    .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});
