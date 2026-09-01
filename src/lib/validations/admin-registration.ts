import { z } from "zod";
import { PACE_CATEGORIES, REGISTRATION_STATUSES } from "@/lib/registration-types";

export const adminRegistrationUpdateSchema = z.object({
  firstName: z.string().min(2, "Il nome deve avere almeno 2 caratteri").max(50),
  lastName: z.string().min(2, "Il cognome deve avere almeno 2 caratteri").max(50),
  email: z.string().email("Inserisci un'email valida"),
  phone: z.string().min(8, "Inserisci un numero di telefono valido").max(20),
  paceCategory: z.enum(PACE_CATEGORIES, {
    message: "Seleziona una fascia di passo",
  }),
  medicalNotes: z.string().max(500).optional().or(z.literal("")),
  status: z.enum([
    REGISTRATION_STATUSES.PENDING_PAYMENT,
    REGISTRATION_STATUSES.PAID_AND_CHECKED_IN,
    REGISTRATION_STATUSES.CANCELLED,
  ]),
});

export type AdminRegistrationUpdateData = z.infer<typeof adminRegistrationUpdateSchema>;
