import { z } from "zod";

export const reviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(2, "Inserisci almeno 2 caratteri.")
    .max(80, "Nome troppo lungo."),
  message: z
    .string()
    .trim()
    .min(10, "Scrivi almeno 10 caratteri.")
    .max(500, "Massimo 500 caratteri."),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
