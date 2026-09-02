import { z } from "zod";

export const walkInRegistrationSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(50),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri").max(50),
  phone: z.string().min(8, "Inserisci un numero di telefono valido").max(20),
  hasPaid: z.boolean(),
});

export type WalkInRegistrationData = z.infer<typeof walkInRegistrationSchema>;
