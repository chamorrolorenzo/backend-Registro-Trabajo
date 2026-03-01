import { buildMonthlySummary } from "../services/summary.service.js";
import Trip from "../models/Trip.js";
import Hour from "../models/Hour.js";
import Company from "../models/company.js";
/**
 * GET /summary?month=&year=
 */
export const getSummary = async (req, res, next) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ message: "Month y year son requeridos" });
        }
        const userId = req.user.id;
        const companyId = req.user.companyId;
        const company = await Company.findById(companyId).lean();
        const m = Number(month);
        const y = Number(year);
        // ⭐ rango del mes
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        const trips = (await Trip.find({
            userId,
            companyId,
            date: { $gte: start, $lte: end },
        }).lean());
        const hours = (await Hour.find({
            userId,
            companyId,
            date: { $gte: start, $lte: end },
        }).lean());
        if (!company) {
            return res.status(404).json({ message: "Empresa no encontrada" });
        }
        const summary = buildMonthlySummary({
            trips,
            hours,
            settings: company.settings,
        });
        res.json(summary);
    }
    catch (error) {
        console.error("SUMMARY ERROR:", error);
        next(error);
    }
};
/**
 * GET /summary/periods
 * Devuelve solo los meses/años que tienen viajes cargados
 */
export const getSummaryPeriods = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const trips = (await Trip.find({ userId }).lean());
        const unique = new Set(trips.map((t) => {
            const d = new Date(t.createdAt);
            return `${d.getMonth() + 1}-${d.getFullYear()}`;
        }));
        const periods = [...unique].map((p) => {
            const [month, year] = p.split("-");
            return { month: Number(month), year: Number(year) };
        });
        res.json(periods);
    }
    catch (e) {
        next(e);
    }
};
