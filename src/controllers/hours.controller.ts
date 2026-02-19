import Hour from "../models/Hour.js";
import { Request, Response, NextFunction } from "express";

/* LISTADO */
export const getHours = async (
  req: Request,
  res: Response
) => {
  const hours = await Hour.find({
    userId: req.user!.id,
    companyId: req.user!.companyId,
  }).sort({ entryTime: -1 });

  res.json(hours);
};

/* CRUD MANUAL */
export const createHour = async (
  req: Request,
  res: Response
) => {
  const hour = await Hour.create({
    userId: req.user!.id,
    companyId: req.user!.companyId,
    date: req.body.date,
    entryTime: req.body.entryTime,
    exitTime: req.body.exitTime || null,
    totalMinutes: req.body.totalMinutes || 0,
  });

  res.status(201).json(hour);
};

export const updateHour = async (
  req: Request,
  res: Response
) => {
  const hour = await Hour.findById(req.params.id);
  if (!hour) return res.status(404).json({ message: "No existe" });

  delete req.body.userId;
  delete req.body.companyId;

  Object.assign(hour, req.body);
  await hour.save();

  res.json(hour);
};

export const deleteHour = async (
  req: Request,
  res: Response
) => {
  await Hour.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
};

/* AUTOMÁTICO */

export const entryHour = async (
  req: Request,
  res: Response
) => {
  const open = await Hour.findOne({
    userId: req.user!.id,
    exitTime: null,
  });

  if (open) {
    return res.status(400).json({ message: "Ya hay jornada abierta" });
  }

  const now = new Date();

  const hour = await Hour.create({
    userId: req.user!.id,
    companyId: req.user!.companyId,
    date: new Date(now.toISOString().slice(0, 10)),
    entryTime: now,
    exitTime: null,
    totalMinutes: 0,
  });

  res.status(201).json(hour);
};

export const exitHour = async (
  req: Request,
  res: Response
) => {
  const open = await Hour.findOne({
    userId: req.user!.id,
    exitTime: null,
  });

  if (!open) {
    return res.status(400).json({ message: "No hay jornada abierta" });
  }

  const now = new Date();

  open.exitTime = now;
  open.totalMinutes = Math.floor(
    (now.getTime() - open.entryTime.getTime()) / 60000
  );

  await open.save();

  res.json(open);
};
