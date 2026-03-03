import Hour from "../models/Hour.js";
import { hourSchema } from "../schemas/hour.schema.js";
/**
 * Helpers: Argentina day (00:00) without parsing locale strings
 */
const getArgentinaDayStart = (baseDate = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(baseDate);
    const y = Number(parts.find((p) => p.type === "year").value);
    const m = Number(parts.find((p) => p.type === "month").value);
    const d = Number(parts.find((p) => p.type === "day").value);
    return new Date(y, m - 1, d); // local date at 00:00
};
const parseLocalYMD = (ymd) => {
    // "YYYY-MM-DD" -> local Date at 00:00 (prevents UTC day shift)
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(y, m - 1, d);
};
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
            // If from/to are "YYYY-MM-DD", use parseLocalYMD to avoid timezone shifts
            const fromDate = /^\d{4}-\d{2}-\d{2}$/.test(from) ? parseLocalYMD(from) : new Date(from);
            const toDate = /^\d{4}-\d{2}-\d{2}$/.test(to) ? parseLocalYMD(to) : new Date(to);
            filter.date = { $gte: fromDate, $lte: toDate };
        }
        // Filtro opcional por username
        if (username && typeof username === "string") {
            filter.username = new RegExp(username, "i");
        }
        // Most recent first
        const hours = await Hour.find(filter).sort({ entryTime: -1 });
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
        // If "date" comes as "YYYY-MM-DD" (string), normalize to local day start
        const normalizedDate = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? parseLocalYMD(date)
            : date;
        const hour = await Hour.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            date: normalizedDate,
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
        const date = getArgentinaDayStart(now);
        const hour = await Hour.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            date, // day bucket (02/03/2029)
            entryTime: now, // exact time (06:30)
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
        open.totalMinutes = Math.max(0, Math.floor((now.getTime() - open.entryTime.getTime()) / 60000));
        await open.save();
        res.json(open);
    }
    catch (error) {
        next(error);
    }
};
/* STATUS (si hay entrada/salida hoy) */
export const getHoursStatus = async (req, res) => {
    try {
        const todayArgentina = getArgentinaDayStart(new Date());
        const record = await Hour.findOne({
            userId: req.user.id,
            companyId: req.user.companyId,
            date: { $gte: todayArgentina },
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
            error: error?.message,
        });
    }
};
