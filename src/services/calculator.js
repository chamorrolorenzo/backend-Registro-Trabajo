// services/calculator.js


//  Horas
export const calculateHours = (hours) => {
  return hours.reduce(
    (acc, h) => {
      acc.totalHours += h.hours;
      acc.extraHours += h.extraHours || 0;
      return acc;
    },
    {
      totalHours: 0,
      extraHours: 0,
    }
  );
};

// Viajes 
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

