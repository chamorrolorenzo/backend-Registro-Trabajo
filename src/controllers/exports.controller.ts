import type { Response, Request } from "express";
import Hour from "../models/Hour.js";
import Trip from "../models/Trip.js";
import Company from "../models/company.js";
import User from "../models/User.js";
import {
  buildHoursPdf,
  buildTripsPdf,
  buildMonthlyReportPdf,
} from "../services/exports/pdf.service.js";

type AuthUser = {
  id: string;
  companyId: string;
};

type AuthRequest = Request & { user?: AuthUser };

const requireUser = (req: AuthRequest, res: Response): AuthUser | null => {
  if (!req.user?.id || !req.user.companyId) {
    res.status(401).json({ message: "No autorizado" });
    return null;
  }
  return req.user;
};

const getMonthRange = (month: number, year: number) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 3, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 3, 0, 0, 0));
  return { start, end };
};

const getMonthLabel = (month: number, year: number) =>
  new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, 15, 3, 0, 0, 0)));

const getUserAndCompany = async (userId: string, companyId: string) => {
  const dbUser = await User.findById(userId);
  const company = await Company.findById(companyId);

  const username = `${dbUser?.nombre ?? ""} ${dbUser?.apellido ?? ""}`.trim() || "Usuario";
  const companyName =
    company?.name
      ? company.name.charAt(0).toUpperCase() + company.name.slice(1)
      : "Empresa";
    return { username, companyName };
};

export const downloadHoursPdf = async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    return res.status(400).json({ message: "month y year son requeridos" });
  }

  const { start, end } = getMonthRange(month, year);
  const monthLabel = getMonthLabel(month, year);
  const { username, companyName } = await getUserAndCompany(user.id, user.companyId);

  const rows = await Hour.find({
    userId: user.id,
    companyId: user.companyId,
    entryTime: { $gte: start, $lt: end },
  }).sort({ entryTime: 1 });

  const pdf = await buildHoursPdf({
    companyName,
    username,
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

  const { start, end } = getMonthRange(month, year);
  const monthLabel = getMonthLabel(month, year);
  const { username, companyName } = await getUserAndCompany(user.id, user.companyId);

  const rows = await Trip.find({
    userId: user.id,
    companyId: user.companyId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  const pdf = await buildTripsPdf({
    companyName,
    username,
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

export const downloadMonthlyPdf = async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const month = Number(req.query.month);
  const year = Number(req.query.year);

  if (!Number.isFinite(month) || !Number.isFinite(year)) {
    return res.status(400).json({ message: "month y year son requeridos" });
  }

  const { start, end } = getMonthRange(month, year);
  const monthLabel = getMonthLabel(month, year);
  const { username, companyName } = await getUserAndCompany(user.id, user.companyId);

  const hours = await Hour.find({
    userId: user.id,
    companyId: user.companyId,
    entryTime: { $gte: start, $lt: end },
  }).sort({ entryTime: 1 });

  const trips = await Trip.find({
    userId: user.id,
    companyId: user.companyId,
    date: { $gte: start, $lt: end },
  }).sort({ date: 1 });

  const pdf = await buildMonthlyReportPdf({
    companyName,
    username,
    monthLabel,
    hours: hours.map((r) => ({
      entryTime: new Date(r.entryTime),
      exitTime: r.exitTime ? new Date(r.exitTime) : null,
      totalMinutes: Number(r.totalMinutes ?? 0),
    })),
    trips: trips.map((r) => ({
      date: new Date(r.date),
      remito: String(r.remito),
      cubicMeters: Number(r.cubicMeters ?? 0),
    })),
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="reporte-${month}-${year}.pdf"`);
  res.send(pdf);
};