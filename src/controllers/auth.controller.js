import User from "../models/User.js";
import Company from "../models/company.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/mailer.js";


// Utils
const capitalize = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/* REGISTER */
export const register = async (req, res) => {
  try {
    const { nombre, apellido, email, username, password, empresa } = req.body;

    
    // Validación básica
    if (!nombre || !apellido || !email || !username || !password || !empresa) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
      });
    }

    // Password: 4 números
    if (!/^\d{4}$/.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener 4 números",
      });
    }

    // Normalización
    const emailNormalized = email.toLowerCase().trim();
    const usernameNormalized = username.toLowerCase().trim();

    // Usuario existente
    const userExists = await User.findOne({
      $or: [
        { email: emailNormalized },
        { username: usernameNormalized },
      ],
    });

    if (userExists) {
      return res.status(400).json({
        message: "Email o usuario ya registrado",
      });
    }

    // Buscar empresa 
    const company = await Company.findOne({
      name: new RegExp(`^${empresa.trim()}$`, "i"),
    });

    if (!company) {
      return res.status(400).json({
        message: "Empresa inexistente. Comunicate con el proveedor.",
      });
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      nombre: capitalize(nombre),
      apellido: capitalize(apellido),
      email: emailNormalized,
      username: usernameNormalized,
      password: hashedPassword,
      companyId: company._id,
    });

    return res.status(201).json({
      message: "Usuario registrado correctamente",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Error interno en el registro",
    });
  }
};

/*  LOGIN */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Faltan credenciales",
      });
    }

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({
        message: "Usuario o contraseña incorrectos",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        companyId: user.companyId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Error en login",
    });
  }
};

/*  ME (TEST / FUTURO) */
export const me = async (req, res) => {
  return res.json({
    ok: true,
  });
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email requerido",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    // Siempre respondemos igual (seguridad)
    if (!user) {
      return res.json({
        message: "Si el email existe, se enviará un link de recuperación",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // DEV: devolvemos link (en prod va por email)
    const FRONT_URL = "https://backend-registro-trabajo.onrender.com";

const link = `${FRONT_URL}/reset-password?token=${token}`;

const info = await transporter.sendMail({
  from: `Horas Viajes <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Restablecer contraseña",
  html: `
    <h3>Restablecer contraseña</h3>
    <p>Hacé click en el siguiente link:</p>
    <a href="${link}">${link}</a>
  `
});

console.log("MAIL ENVIADO:", info.response);

return res.json({
  message: "Si el email existe, se enviará un link de recuperación"
});

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Error generando link",
    });
  }
};


/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token y nueva contraseña requeridos",
      });
    }

    // misma regla: 4 números
    if (!/^\d{4}$/.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener 4 números",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hash = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, {
      password: hash,
    });

    return res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(400).json({
      message: "Token inválido o expirado",
    });
  }
};

