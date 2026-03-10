import Hour from "../models/Hour.js";
export const autoCloseOpenHoursForUser = async (
  userId: string,
  companyId: string
) => {
  const openHours = await Hour.find({
    userId,
    companyId,
    exitTime: null
  });

  const now = new Date();

  for (const hour of openHours) {
    const entry = new Date(hour.entryTime);

    const entryArgentina = new Date(entry.getTime() - 3 * 60 * 60 * 1000);
    const nowArgentina = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const entryYear = entryArgentina.getUTCFullYear();
    const entryMonth = entryArgentina.getUTCMonth();
    const entryDay = entryArgentina.getUTCDate();

    const nowYear = nowArgentina.getUTCFullYear();
    const nowMonth = nowArgentina.getUTCMonth();
    const nowDay = nowArgentina.getUTCDate();

    const isOldOpenHour =
      entryYear !== nowYear ||
      entryMonth !== nowMonth ||
      entryDay !== nowDay;

    if (!isOldOpenHour) continue;

    const autoExit = new Date(Date.UTC(entryYear, entryMonth, entryDay, 20, 0, 0));

    const totalMinutes = Math.max(
      0,
      Math.floor((autoExit.getTime() - entry.getTime()) / 60000)
    );

    hour.exitTime = autoExit;
    hour.totalMinutes = totalMinutes;

    await hour.save();
  }
};