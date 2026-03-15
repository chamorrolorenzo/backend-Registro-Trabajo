import Hour from "../models/Hour.js";
import { hourSchema } from "../schemas/hour.schema.js";
import { autoCloseOpenHoursForUser } from "../services/autoCloseHours.js";
/**
 * Bucket Argentina:
 * guardamos inicio del día ARG como 03:00Z (00:00 ARG).
 */
const ARG_UTC_OFFSET_HOURS = 3;
const isYMD = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const getArgentinaYMDParts = (baseDate = new Date()) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(baseDate);
    const y = Number(parts.find((p) => p.type === "year")?.value);
    const m = Number(parts.find((p) => p.type === "month")?.value);
    const d = Number(parts.find((p) => p.type === "day")?.value);
    return { y, m, d };
};
const argentinaDayStartUTC = (baseDate = new Date()) => {
    const { y, m, d } = getArgentinaYMDParts(baseDate);
    return new Date(Date.UTC(y, m - 1, d, ARG_UTC_OFFSET_HOURS, 0, 0, 0));
};
const argentinaDayStartUTCFromYMD = (ymd) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, ARG_UTC_OFFSET_HOURS, 0, 0, 0));
};
const addDaysUTC = (date, days) => {
    const copy = new Date(date.getTime());
    copy.setUTCDate(copy.getUTCDate() + days);
    return copy;
};
const requireUser = (req, res) => {
    if (!req.user?.id || !req.user.companyId) {
        res.status(401).json({ message: "No autorizado" });
        return null;
    }
    return req.user;
};
/* GET /hours */
export const getHours = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        await autoCloseOpenHoursForUser(user.id, user.companyId);
        const { from, to, username } = req.query;
        const filter = {
            userId: user.id,
            companyId: user.companyId,
        };
        // rango por bucket Argentina: [fromBucket, toBucket+1d)
        if (typeof from === "string" && typeof to === "string") {
            const fromStart = isYMD(from) ? argentinaDayStartUTCFromYMD(from) : new Date(from);
            const toStart = isYMD(to) ? argentinaDayStartUTCFromYMD(to) : new Date(to);
            if (Number.isNaN(fromStart.getTime()) || Number.isNaN(toStart.getTime())) {
                return res.status(400).json({ message: "Rango de fechas inválido" });
            }
            filter.date = { $gte: fromStart, $lt: addDaysUTC(toStart, 1) };
        }
        if (typeof username === "string" && username.trim()) {
            filter.username = new RegExp(username.trim(), "i");
        }
        const hours = await Hour.find(filter).sort({ entryTime: -1 });
        res.json(hours);
    }
    catch (error) {
        next(error);
    }
};
/* POST /hours (manual) */
export const createHour = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        await autoCloseOpenHoursForUser(user.id, user.companyId);
        const parsed = hourSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0]?.message ?? "Datos inválidos",
            });
        }
        const { date, entryTime, exitTime, totalMinutes } = parsed.data;
        // bucket correcto siempre
        const bucket = date ?? argentinaDayStartUTC(entryTime);
        const hour = await Hour.create({
            userId: user.id,
            companyId: user.companyId,
            date: bucket,
            entryTime,
            exitTime,
            totalMinutes: totalMinutes ?? 0,
        });
        res.status(201).json(hour);
    }
    catch (error) {
        next(error);
    }
};
/* PATCH /hours/:id */
export const updateHour = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        await autoCloseOpenHoursForUser(user.id, user.companyId);
        const hour = await Hour.findOne({
            _id: req.params.id,
            userId: user.id,
            companyId: user.companyId,
        });
        if (!hour)
            return res.status(404).json({ message: "Registro no encontrado" });
        // no permitir ownership
        if ("userId" in req.body || "companyId" in req.body) {
            return res.status(400).json({ message: "No se permite modificar ownership" });
        }
        // normalizar date si viene
        if ("date" in req.body) {
            const incoming = req.body.date;
            if (!isYMD(incoming)) {
                return res.status(400).json({ message: "date debe ser YYYY-MM-DD" });
            }
            req.body.date = argentinaDayStartUTCFromYMD(incoming);
        }
        Object.assign(hour, req.body);
        await hour.save();
        res.json(hour);
    }
    catch (error) {
        next(error);
    }
};
/* DELETE /hours/:id */
export const deleteHour = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        const deleted = await Hour.findOneAndDelete({
            _id: req.params.id,
            userId: user.id,
            companyId: user.companyId,
        });
        if (!deleted)
            return res.status(404).json({ message: "Registro no encontrado" });
        res.json({ ok: true, message: "Registro eliminado" });
    }
    catch (error) {
        next(error);
    }
};
/* POST /hours/entry */
export const entryHour = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        const now = new Date();
        const open = await Hour.findOne({
            userId: user.id,
            companyId: user.companyId,
            exitTime: null,
        });
        if (open)
            return res.status(400).json({ message: "Ya hay una jornada abierta" });
        // anti doble click
        const ninetySecondsAgo = new Date(now.getTime() - 90 * 1000);
        const recent = await Hour.findOne({
            userId: user.id,
            companyId: user.companyId,
            entryTime: { $gte: ninetySecondsAgo },
        }).sort({ entryTime: -1 });
        if (recent)
            return res.status(200).json(recent);
        const date = argentinaDayStartUTC(now);
        const hour = await Hour.create({
            userId: user.id,
            companyId: user.companyId,
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
/* POST /hours/exit */
export const exitHour = async (req, res, next) => {
    try {
        const user = requireUser(req, res);
        if (!user)
            return;
        const open = await Hour.findOne({
            userId: user.id,
            companyId: user.companyId,
            exitTime: null,
        });
        if (!open)
            return res.status(400).json({ message: "No hay jornada abierta para cerrar" });
        const now = new Date();
        open.exitTime = now;
        open.totalMinutes = Math.max(0, Math.floor((now.getTime() - open.entryTime.getTime()) / 60000));
        // auto-corrige bucket
        open.date = argentinaDayStartUTC(open.entryTime);
        await open.save();
        res.json(open);
    }
    catch (error) {
        next(error);
    }
};
/* GET /hours/status */
export const getHoursStatus = async (req, res) => {
    const user = requireUser(req, res);
    if (!user)
        return;
    try {
        const todayBucket = argentinaDayStartUTC(new Date());
        const record = await Hour.findOne({
            userId: user.id,
            companyId: user.companyId,
            date: todayBucket,
        }).sort({ entryTime: -1 });
        res.json({
            hasEntry: Boolean(record?.entryTime),
            hasExit: Boolean(record?.exitTime),
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: "Error obteniendo estado de horas", error: message });
    }
};
