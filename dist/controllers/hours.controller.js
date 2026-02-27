import Hour from "../models/Hour.js";
import { hourSchema } from "../schemas/hour.schema.js";

/* GET HOURS */
export const getHours = async (req, res, next) => {
    try {
        const { from, to, username } = req.query;
        const filter = {
            userId: req.user.id,
            companyId: req.user.companyId,
        };
        // Filtro por rango de fechas
        if (from && to && typeof from === "string" && typeof to === "string") {
            filter.date = {
                $gte: new Date(from),
                $lte: new Date(to),
            };
        }
        // Filtro opcional por username
        if (username && typeof username === "string") {
            filter.username = new RegExp(username, "i");
        }
        const hours = await Hour.find(filter).sort({ date: -1 });
        res.json(hours);
    }
    catch (error) {
        next(error);
    }
};
/* CRUD MANUAL */
export const createHour = async (req, res, next) => {
    try {
        const parsed = hourSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { date, entryTime, exitTime, totalMinutes } = parsed.data;
        const hour = await Hour.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            date,
            entryTime,
            exitTime: exitTime ?? null,
            totalMinutes: totalMinutes ?? 0,
        });
        res.status(201).json(hour);
    }
    catch (error) {
        next(error);
    }
};
export const updateHour = async (req, res, next) => {
  try {
    const hour = await Hour.findOne({
      _id: req.params.id,
      userId: req.user.id,
      companyId: req.user.companyId,
    });

    if (!hour) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    // Evitar que modifiquen identidad
    delete req.body.userId;
    delete req.body.companyId;

    Object.assign(hour, req.body);
    await hour.save();

    res.json(hour);
  } catch (error) {
    next(error);
  }
};

export const deleteHour = async (req, res, next) => {
  try {
    const deleted = await Hour.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
      companyId: req.user.companyId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
};

/* ENTRADA  AUTOMÁTICa */
export const entryHour = async (req, res, next) => {
    try {
        const open = await Hour.findOne({
            userId: req.user.id,
            companyId: req.user.companyId,
            exitTime: null,
        });
        if (open) {
            return res.status(400).json({ message: "Ya hay jornada abierta" });
        }
        const now = new Date();
        // Fecha normalizada Argentina
        const date = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
        date.setHours(0, 0, 0, 0);
        const hour = await Hour.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            date: date, // 🔥 ESTO FALTABA
            entryTime: now,
            exitTime: null,
            totalMinutes: 0,
        });
        res.status(201).json(hour);
    }
    catch (error) {
        next(error);
    }
};
/* SALIDA */
export const exitHour = async (req, res, next) => {
    try {
        const open = await Hour.findOne({
            userId: req.user.id,
            companyId: req.user.companyId,
            exitTime: null,
        });
        if (!open) {
            return res.status(400).json({ message: "No hay jornada abierta" });
        }
        const now = new Date();
        open.exitTime = now;
        open.totalMinutes = Math.floor((now.getTime() - open.entryTime.getTime()) / 60000);
        await open.save();
        res.json(open);
    }
    catch (error) {
        next(error);
    }
};
