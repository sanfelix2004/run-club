import { z } from "zod";
import { PACE_CATEGORIES } from "@/lib/registration-types";

export const athleteProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Il nome deve avere almeno 2 caratteri")
    .max(50),
  lastName: z
    .string()
    .min(2, "Il cognome deve avere almeno 2 caratteri")
    .max(50),
  phone: z
    .string()
    .min(8, "Inserisci un numero di telefono valido")
    .max(20),
  paceCategory: z.enum(PACE_CATEGORIES, {
    message: "Seleziona una fascia di passo",
  }),
  medicalNotes: z
    .string()
    .max(500, "Massimo 500 caratteri")
    .optional()
    .or(z.literal("")),
});

export type AthleteProfileData = z.infer<typeof athleteProfileSchema>;
