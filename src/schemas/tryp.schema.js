import { z } from "zod";

export const tripSchema = z.object({
  remito: z
    .string()
    .min(1, "Remito requerido")
    .trim(),

  cubicMeters: z
    .number({
      invalid_type_error: "Los metros cúbicos deben ser un número",
    })
    .positive("Los metros cúbicos deben ser mayores a 0"),

  date: z
    .string()
    .min(1, "Fecha requerida"),
});
