import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
import authRoutes from "./routes/auth.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import hoursRoutes from "./routes/hours.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { Request, Response, NextFunction } from "express";
import exportsRoutes from "./routes/exports.routes.js"
// src/index.ts (o app.ts / server.ts) -> donde montás rutas



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* Middlewares */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://frontend-registro-trabajo.vercel.app",
];

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

/* ---- Rutas públicas ---- */
app.use("/auth", authRoutes);

/* ---- Rutas protegidas ---- */
app.use("/trips", tripsRoutes);

/* ---- Export excel / pdf ---- */
app.use("/exports", exportsRoutes);

/* ---- Summary (cálculo mensual) ---- */
app.use("/summary", summaryRoutes);

/* --- Horas --- */
app.use("/hours", hoursRoutes);

/* ---- Frontend build (Vite dist) ---- */
app.use(express.static(path.join(__dirname, "../dist")));

/* ---- Middleware de errores ---- */
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error(err);

    res.status(err.status || 500).json({
      message: err.message || "Error interno del servidor",
    });
  }
);


export default app;
