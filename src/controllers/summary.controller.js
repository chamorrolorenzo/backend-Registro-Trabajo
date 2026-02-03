import { buildMonthlySummary } from "../services/summary.service.js";

export const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ message: "Month y year son requeridos" });
    }

    const summary = await buildMonthlySummary({
      userId: req.user.id,
      companyId: req.user.companyId,
      month: Number(month),
      year: Number(year),
    });

    res.json(summary);
  } catch (error) {
    next(error);
  }
};
