import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri").max(120),
  dateTime: z.string().min(1, "Data e ora obbligatorie"),
  locationName: z.string().min(3, "Luogo obbligatorio").max(200),
  priceAmount: z.coerce.number().min(0, "Prezzo non valido").max(9999),
  currency: z.string().min(3).max(3).default("EUR"),
  description: z.string().max(500).optional().or(z.literal("")),
});

export type EventFormData = z.infer<typeof eventSchema>;
