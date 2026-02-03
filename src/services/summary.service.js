// summary.service.js

/**
 * Construye un resumen para un período dado.
 * - NO tira errores si no hay datos.
 * - La falta de datos es un estado válido (empty = true).
 * - Funciona para pago por viajes, horas o ambos.
 */

export const buildMonthlySummary = ({
  trips = [],
  hours = [],
  payMode = {},
  prices = {},
}) => {
  // Defaults seguros
  const {
    pricePerTrip = 0,
    pricePerHour = 0,
  } = prices;

  const byTrips = Boolean(payMode.byTrips);
  const byHours = Boolean(payMode.byHours);

  const noTrips = !trips || trips.length === 0;
  const noHours = !hours || hours.length === 0;

  /**
   * 🔴 LÓGICA CORRECTA DE "EMPTY"
   * - Si se paga por viajes y no hay viajes → empty
   * - Si se paga por horas y no hay horas → empty
   * - Si se paga por ambos y faltan ambos → empty
   *
   * O sea: OR, no AND
   */
  if (
    (byTrips && noTrips) ||
    (byHours && noHours)
  ) {
    return {
      empty: true,
      message: "Todavía no cargaste viajes ni horas para este período",
      totalTrips: 0,
      totalHours: 0,
      totalAmount: 0,
    };
  }

  // 🧮 CÁLCULOS
  const totalTrips = noTrips ? 0 : trips.length;

  const totalHours = noHours
    ? 0
    : hours.reduce((acc, h) => acc + (h.hours || 0), 0);

  let totalAmount = 0;

  if (byTrips && !noTrips) {
    totalAmount += totalTrips * pricePerTrip;
  }

  if (byHours && !noHours) {
    totalAmount += totalHours * pricePerHour;
  }

  return {
    empty: false,
    totalTrips,
    totalHours,
    totalAmount,
  };
};
