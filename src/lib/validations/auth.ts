import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(80),
    email: z.string().email("Inserisci un'email valida"),
    password: z
      .string()
      .min(8, "La password deve avere almeno 8 caratteri")
      .max(72),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  password: z.string().min(1, "Inserisci la password"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
