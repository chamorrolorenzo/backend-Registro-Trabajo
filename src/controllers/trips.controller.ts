import Trip from "../models/Trip.js";
import { tripSchema } from "../schemas/trip.schema.js";
import { Request, Response, NextFunction } from "express";

// CREATE
export const createTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      companyId: req.user!.companyId,
    });

    if (existingTrip) {
      return res.status(400).json({
        message: "El remito ya fue registrado",
      });
    }

    const trip = await Trip.create({
      userId: req.user!.id,
      companyId: req.user!.companyId,
      remito,
      cubicMeters,
      date: new Date(),
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};

// LIST
export const getTrips = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { remito, from, to, minCubic, month, year } = req.query;

    const filter: any = {
      userId: req.user!.id,
      companyId: req.user!.companyId,
    };

    // ✅ filtro por remito
    if (remito && typeof remito === "string") {
      filter.remito = new RegExp(remito, "i");
    }

    // ⭐ PRIORIDAD 1 — filtro por MES (lo que usa el frontend)
    if (
      month &&
      year &&
      typeof month === "string" &&
      typeof year === "string"
    ) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    // ⭐ PRIORIDAD 2 — filtro manual por rango
    else if (
      from &&
      to &&
      typeof from === "string" &&
      typeof to === "string"
    ) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // ✅ filtro metros cúbicos
    if (minCubic && typeof minCubic === "string") {
      filter.cubicMeters = { $gte: Number(minCubic) };
    }

    const trips = await Trip.find(filter).sort({ date: -1 });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const trip = await Trip.findOneAndUpdate(
      {
        _id: id,
        userId: req.user!.id,
        companyId: req.user!.companyId,
      },
      parsed.data,
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({
        message: "Viaje no encontrado o no autorizado",
      });
    }

    res.json(trip);
  } catch (error) {
    next(error);
  }
};

// DELETE
export const deleteTrip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOneAndDelete({
      _id: id,
      userId: req.user!.id,
      companyId: req.user!.companyId,
    });

    if (!trip) {
      return res.status(404).json({
        message: "Viaje no encontrado o no autorizado",
      });
    }

    res.json({ message: "Viaje eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};