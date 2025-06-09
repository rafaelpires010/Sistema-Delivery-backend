import { z } from "zod";

export const signinSchema = z.object({
  email: z
    .string({ message: "Email é obrigatório" })
    .email({ message: "O email deve ser válido." }),
  senha: z.string({ message: "Senha é obrigatória" }),
});
