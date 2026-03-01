export const calculateHours = (hours) => {
    let normalMinutes = 0;
    let extraMinutes = 0;
    hours.forEach((h) => {
        if (!h.totalMinutes)
            return;
        if (h.totalMinutes <= 480) {
            normalMinutes += h.totalMinutes;
        }
        else {
            normalMinutes += 480;
            extraMinutes += h.totalMinutes - 480;
        }
    });
    return {
        totalHours: Math.round(((normalMinutes + extraMinutes) / 60) * 100) / 100,
        extraHours: Math.round((extraMinutes / 60) * 100) / 100,
    };
};
export const calculateTrips = (trips, settings) => {
    const { pricePerTrip = 0, pricePerCubicMeter = 0 } = settings;
    const result = trips.reduce((acc, trip) => {
        acc.totalTrips += 1;
        acc.totalCubicMeters += Number(trip.cubicMeters || 0);
        acc.totalAmount +=
            pricePerTrip + pricePerCubicMeter * Number(trip.cubicMeters || 0);
        return acc;
    }, {
        totalTrips: 0,
        totalCubicMeters: 0,
        totalAmount: 0,
    });
    return result;
};
