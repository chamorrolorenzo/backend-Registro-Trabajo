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
        const hour = await Hour.findById(req.params.id);
        if (!hour) {
            return res.status(404).json({ message: "No existe" });
        }
        // Seguridad
        delete req.body.userId;
        delete req.body.companyId;
        Object.assign(hour, req.body);
        await hour.save();
        res.json(hour);
    }
    catch (error) {
        next(error);
    }
};
export const deleteHour = async (req, res, next) => {
    try {
        await Hour.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    }
    catch (error) {
        next(error);
    }
};
/* ENTRADA AUTOMÁTICA */
export const entryHour = async (req, res, next) => {
    try {
        const open = await Hour.findOne({
            userId: req.user.id,
            companyId: req.user.companyId,
            exitTime: null,
        });
        if (open) {
            res.status(400).json({ message: "Ya hay jornada abierta" });
            return;
        }
        const now = new Date();
        // ⭐ convertir a horario Argentina
        const argentinaNow = new Date(now.toLocaleString("en-US", {
            timeZone: "America/Argentina/Buenos_Aires",
        }));
        const date = new Date(argentinaNow.getFullYear(), argentinaNow.getMonth(), argentinaNow.getDate());
        const hour = await Hour.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            date,
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
export const getHoursStatus = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const record = await Hour.findOne({
            userId: req.user.id,
            companyId: req.user.companyId,
            date: { $gte: today },
        });
        res.json({
            hasEntry: !!record?.entryTime,
            hasExit: !!record?.exitTime,
        });
    }
    catch (error) {
        console.error("GET HOURS STATUS ERROR:", error);
        res.status(500).json({
            message: "Error getting hours status",
            error: error?.message
        });
    }
};
