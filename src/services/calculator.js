// services/calculator.js

// HORAS (usa totalMinutes del modelo Hour)
export const calculateHours = (hours = []) => {
  let normalMinutes = 0;
  let extraMinutes = 0;

  hours.forEach(h => {
    if (!h.totalMinutes) return;

    // 8 horas = 480 minutos
    if (h.totalMinutes <= 480) {
      normalMinutes += h.totalMinutes;
    } else {
      normalMinutes += 480;
      extraMinutes += h.totalMinutes - 480;
    }
  });

  return {
    totalHours: +(normalMinutes / 60).toFixed(2),
    extraHours: +(extraMinutes / 60).toFixed(2)
  };
};


// VIAJES (esto estaba bien)
export const calculateTrips = (trips, settings) => {
  return trips.reduce(
    (acc, trip) => {
      const amount =
        settings.pricePerTrip +
        trip.cubicMeters * settings.pricePerCubicMeter;

      acc.totalTrips += 1;
      acc.totalCubicMeters += trip.cubicMeters;
      acc.totalAmount += amount;

      return acc;
    },
    {
      totalTrips: 0,
      totalCubicMeters: 0,
      totalAmount: 0,
    }
  );
};
