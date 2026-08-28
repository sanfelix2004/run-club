import { z } from "zod";
import { PACE_CATEGORIES } from "@/lib/registration-types";

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50),
  lastName: z
    .string()
    .min(2, "Il cognome deve avere almeno 2 caratteri")
    .max(50),
  email: z.string().email("Inserisci un'email valida"),
  phone: z
    .string()
    .min(8, "Inserisci un numero di telefono valido")
    .max(20),
  emergencyName: z
    .string()
    .min(2, "Inserisci il nome del contatto di emergenza")
    .max(80),
  emergencyPhone: z
    .string()
    .min(8, "Inserisci un telefono di emergenza valido")
    .max(20),
  paceCategory: z.enum(PACE_CATEGORIES, {
    message: "Seleziona una fascia di passo",
  }),
  acceptPrivacy: z
    .boolean()
    .refine((value) => value === true, {
      message: "Devi accettare privacy e termini per procedere.",
    }),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
