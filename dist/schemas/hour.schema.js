import { z } from "zod";
export const hourSchema = z.object({
    date: z.string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Fecha inválida",
    })
        .transform((val) => new Date(val)),
    entryTime: z.string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Hora de entrada inválida",
    })
        .transform((val) => new Date(val)),
    exitTime: z.string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Hora de salida inválida",
    })
        .transform((val) => (val ? new Date(val) : null)),
    totalMinutes: z.number().int().nonnegative().optional(),
});
