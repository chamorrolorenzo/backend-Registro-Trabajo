import { z } from "zod";

// REGISTER
export const registerSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  apellido: z.string().min(1, "Apellido requerido"),

  username: z.string().min(8, "El usuario debe tener al menos 8 caracteres"),

  email: z.string().email("Email inválido"),

  password: z.string().regex(/^\d{4}$/, "La contraseña debe ser exactamente 4 números"),

  empresa: z.string().min(1, "Empresa requerida"),
});

// LOGIN
export const loginSchema = z.object({
  username: z.string().min(1, "Usuario requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// FORGOT PASSWORD
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

// RESET PASSWORD
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  password: z.string().regex(/^\d{4}$/, "La contraseña debe ser exactamente 4 números"),
});
