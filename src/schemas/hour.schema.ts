import { z } from "zod";

const isYMD = (v: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(v);

// "YYYY-MM-DD" -> 03:00Z (00:00 Argentina)
const argentinaBucketFromYMD = (ymd: string): Date => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0));
};

export const hourSchema = z.object({
  // ✅ opcional para que createHour pueda calcularlo desde entryTime si no viene
  date: z
    .string()
    .optional()
    .refine((val) => !val || isYMD(val), { message: "date debe ser YYYY-MM-DD" })
    .transform((val) => (val ? argentinaBucketFromYMD(val) : undefined)),

  entryTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Hora de entrada inválida",
    })
    .transform((val) => new Date(val)),

  exitTime: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Hora de salida inválida",
    })
    .transform((val) => (val ? new Date(val) : null)),

  totalMinutes: z.number().int().nonnegative().optional(),
});

export type HourInput = z.infer<typeof hourSchema>; 