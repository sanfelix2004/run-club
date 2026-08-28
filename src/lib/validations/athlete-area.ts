import { z } from "zod";

export const athleteLoginSchema = z.object({
  email: z.string().email("Inserisci un'email valida"),
  phone: z
    .string()
    .min(8, "Inserisci il numero di telefono usato in iscrizione")
    .max(20),
});

export type AthleteLoginData = z.infer<typeof athleteLoginSchema>;
