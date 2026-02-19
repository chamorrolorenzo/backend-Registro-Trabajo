import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Rutas
//import authRoutes from "./routes/auth.routes.js";
import tripsRoutes from "./routes/trips.routes.js";
import hoursRoutes from "./routes/hours.routes.js";
import exportsRoutes from "./routes/exports.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { Request, Response, NextFunction } from "express";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* Middlewares */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  }
));
app.use(express.json());

/* ---- Rutas públicas ---- */
//app.use("/auth", authRoutes);

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

app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

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
