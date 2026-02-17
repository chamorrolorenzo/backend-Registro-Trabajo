import User from "../models/User.js";
import Company from "../models/company.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import { registerSchema } from "../schemas/auth.schema.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// Utils
const capitalize = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* REGISTER */
export const register = async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.issues[0].message,
      });
    }

    const { nombre, apellido, email, username, password, empresa } = parsed.data;

    const emailNormalized = email.toLowerCase().trim();
    const usernameNormalized = username.toLowerCase().trim();

    const emailExists = await User.findOne({ email: emailNormalized });
    if (emailExists) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    const usernameExists = await User.findOne({ username: usernameNormalized });
    if (usernameExists) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    const company = await Company.findOne({
      name: new RegExp(`^${empresa.trim()}$`, "i"),
    });

    if (!company) {
      return res.status(400).json({
        message: "Empresa inexistente. Comunicate con el proveedor.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      nombre: capitalize(nombre),
      apellido: capitalize(apellido),
      email: emailNormalized,
      username: usernameNormalized,
      password: hashedPassword,
      companyId: company._id,
    });

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Error interno en el registro" });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Faltan credenciales" });
    }

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Error en login" });
  }
};

/* ME */
export const me = async (req, res) => {
  res.json({ ok: true });
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    res.json({
      message: "Si el email existe, se enviará un link de recuperación",
    });

    if (!user) return;

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const FRONT_URL = "https://backend-registro-trabajo.onrender.com";
    const link = `${FRONT_URL}/reset-password?token=${token}`;

    resend.emails
      .send({
        from: "Horas Viajes <onboarding@resend.dev>",
        to: email,
        subject: "Restablecer contraseña",
        html: `
          <h3>Restablecer contraseña</h3>
          <p>Hacé click en el siguiente link:</p>
          <a href="${link}">${link}</a>
        `,
      })
      .then(() => console.log("MAIL ENVIADO CON RESEND"))
      .catch((err) => console.error("ERROR RESEND:", err));
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token y nueva contraseña requeridos" });
    }

    if (!/^\d{4}$/.test(password)) {
      return res.status(400).json({ message: "La contraseña debe tener 4 números" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hash });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};
