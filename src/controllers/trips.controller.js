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

    const { remito, cubicMeters, date } = parsed.data;

    const trip = await Trip.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      remito,
      cubicMeters,
      date,
    });

    res.status(201).json(trip);
  } catch (error) {
    next(error);
  }
};


// LIST
export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({
      userId: req.user.id,
      companyId: req.user.companyId,
    }).sort({ date: -1 });

    res.json(trips);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.id,
        companyId: req.user.companyId,
      },
      req.body,
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
  } catch (error) {
    next(error);
  }
};
