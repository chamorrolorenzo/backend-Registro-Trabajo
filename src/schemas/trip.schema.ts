import { z } from "zod";

export const tripSchema = z.object({
  remito: z
    .string()
    .min(1, "Remito requerido")
    .trim(),

  cubicMeters: z
  .coerce.number()
  .positive("Los metros cúbicos deben ser mayores a 0"),
 });
