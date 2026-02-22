import Trip from "../models/Trip.js";
import { tripSchema } from "../schemas/trip.schema.js";
// CREATE
export const createTrip = async (req, res, next) => {
    try {
        const parsed = tripSchema.safeParse({
            ...req.body,
            cubicMeters: Number(req.body.cubicMeters),
        });
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { remito, cubicMeters } = parsed.data;
        const existingTrip = await Trip.findOne({
            remito,
            companyId: req.user.companyId,
        });
        if (existingTrip) {
            return res.status(400).json({
                message: "El remito ya fue registrado",
            });
        }
        const trip = await Trip.create({
            userId: req.user.id,
            companyId: req.user.companyId,
            remito,
            cubicMeters,
            date: new Date(),
        });
        res.status(201).json(trip);
    }
    catch (error) {
        next(error);
    }
};
// LIST
export const getTrips = async (req, res, next) => {
    try {
        const { remito, from, to, minCubic } = req.query;
        const filter = {
            userId: req.user.id,
            companyId: req.user.companyId,
        };
        // Filtrar por remito (parcial)
        if (remito && typeof remito === "string") {
            filter.remito = new RegExp(remito, "i");
        }
        // Filtrar por rango de fechas
        if (from && to && typeof from === "string" && typeof to === "string") {
            filter.date = {
                $gte: new Date(from),
                $lte: new Date(to),
            };
        }
        // Filtrar por mínimo de metros cúbicos
        if (minCubic && typeof minCubic === "string") {
            filter.cubicMeters = { $gte: Number(minCubic) };
        }
        const trips = await Trip.find(filter).sort({ createdAt: -1 });
        res.json(trips);
    }
    catch (error) {
        next(error);
    }
};
// UPDATE
export const updateTrip = async (req, res, next) => {
    try {
        const parsed = tripSchema.partial().safeParse({
            ...req.body,
            ...(req.body.cubicMeters !== undefined && {
                cubicMeters: Number(req.body.cubicMeters),
            }),
        });
        if (!parsed.success) {
            return res.status(400).json({
                message: parsed.error.issues[0].message,
            });
        }
        const { id } = req.params;
        const trip = await Trip.findOneAndUpdate({
            _id: id,
            userId: req.user.id,
            companyId: req.user.companyId,
        }, parsed.data, { new: true });
        if (!trip) {
            return res.status(404).json({
                message: "Viaje no encontrado o no autorizado",
            });
        }
        res.json(trip);
    }
    catch (error) {
        next(error);
    }
};
// DELETE
export const deleteTrip = async (req, res, next) => {
    try {
        const { id } = req.params;
        const trip = await Trip.findOneAndDelete({
            _id: id,
            userId: req.user.id,
            companyId: req.user.companyId,
        });
        if (!trip) {
            return res.status(404).json({
                message: "Viaje no encontrado o no autorizado",
            });
        }
        res.json({ message: "Viaje eliminado correctamente" });
    }
    catch (error) {
        next(error);
    }
};
