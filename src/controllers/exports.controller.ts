import type { Response } from "express";
import type { Request } from "express";
import Hour from "../models/Hour.js";
import Trip from "../models/Trip.js";
import { buildHoursPdf, buildTripsPdf } from "../services/exports/pdf.service.js";

type AuthUser = { id: string; companyId: string; username?: string; companyName?: string };
type AuthRequest = Request & { user?: AuthUser };

const requireUser = (req: AuthRequest, res: Response): AuthUser | null => {
  if (!req.user?.id || !req.user.companyId) {
    res.status(401).json({ message: "No autorizado" });
    return null;
  }
  return req.user;
};

export const downloadHoursPdf = async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    return res.status(400).json({ message: "month y year son requeridos" });
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 3, 0, 0, 0));

  const rows = await Hour.find({
    userId: user.id,
    companyId: user.companyId,
    entryTime: { $gte: start, $lt: end },
  }).sort({ entryTime: 1 });

  const monthLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 15, 3, 0, 0, 0)));

  const pdf = await buildHoursPdf({
    companyName: user.companyName ?? "Empresa",
    username: user.username ?? "Usuario",
    monthLabel,
    rows: rows.map((r) => ({
      entryTime: new Date(r.entryTime),
      exitTime: r.exitTime ? new Date(r.exitTime) : null,
      totalMinutes: Number(r.totalMinutes ?? 0),
    })),
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="horas-${month}-${year}.pdf"`);
  res.send(pdf);
};

export const downloadTripsPdf = async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    return res.status(400).json({ message: "month y year son requeridos" });
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 3, 0, 0, 0));

  const rows = await Trip.find({
    userId: user.id,
    companyId: user.companyId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  const monthLabel = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 15, 3, 0, 0, 0)));

  const pdf = await buildTripsPdf({
    companyName: user.companyName ?? "Empresa",
    username: user.username ?? "Usuario",
    monthLabel,
    rows: rows.map((r) => ({
      date: new Date(r.date),
      remito: String(r.remito),
      cubicMeters: Number(r.cubicMeters ?? 0),
    })),
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="viajes-${month}-${year}.pdf"`);
  res.send(pdf);
};