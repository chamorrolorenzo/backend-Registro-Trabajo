import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  apellido: z.string().min(1, "Apellido requerido"),

  username: z.string().min(8, "El usuario debe tener al menos 8 caracteres"),

  email: z.string().email("Email inválido"),

  password: z
    .string()
    .regex(/^\d{4}$/, "La contraseña debe ser 4 números"),

  empresa: z.string().min(1, "Empresa requerida"),
});
