import { calculateTrips, calculateHours } from "./calculator.js";

/**
 * Construye el resumen mensual según configuración real de la empresa.
 * Siempre devuelve todas las líneas (viajes, horas, incentivo),
 * aunque alguna no sume al total.
 */
export const buildMonthlySummary = ({
  trips = [],
  hours = [],
  settings = {},
}) => {
  const {
    payMode = {
      byTrips: false,
      byHours: false,
    },
    pricePerHour = 0,
    pricePerTrip = 0,
    pricePerCubicMeter = 0,
    incentives = {},
  } = settings;

  // Calculadores base
  const tripStats = calculateTrips(trips, {
    pricePerTrip,
    pricePerCubicMeter,
  });

  const hourStats = calculateHours(hours);

  // Subtotales según lógica de negocio
  const tripsSubtotal = payMode.byTrips ? tripStats.totalAmount : 0;

  const hoursSubtotal = payMode.byHours
    ? hourStats.totalHours * pricePerHour
    : 0;

  // Incentivo mensual (si no existe queda en 0)
  const incentive = incentives?.bonusMonthly || 0;

  // Total general
  const total = tripsSubtotal + hoursSubtotal + incentive;

  // Si no hay absolutamente nada cargado
  const empty =
    tripStats.totalTrips === 0 &&
    hourStats.totalHours === 0 &&
    incentive === 0;

  if (empty) {
    return {
      empty: true,
      message: "Todavía no cargaste viajes ni horas para este período",
      trips: {
        count: 0,
        cubicMeters: 0,
        subtotal: 0,
      },
      hours: {
        normal: 0,
        extra: 0,
        subtotal: 0,
      },
      incentive: 0,
      total: 0,
    };
  }

  // Resumen completo
  return {
    empty: false,

    trips: {
      count: tripStats.totalTrips,
      cubicMeters: tripStats.totalCubicMeters,
      subtotal: tripStats.totalAmount, // siempre mostramos el subtotal real
    },

    hours: {
      normal: hourStats.totalHours,
      extra: hourStats.extraHours,
      subtotal: hoursSubtotal,
    },

    incentive,

    total,
  };
};
