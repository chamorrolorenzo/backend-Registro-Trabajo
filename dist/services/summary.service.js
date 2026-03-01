import { calculateTrips, calculateHours } from "./calculator.js";
export const buildMonthlySummary = ({ trips = [], hours = [], settings = {}, }) => {
    const { payMode = {
        byTrips: false,
        byHours: false,
    }, pricePerHour = 0, pricePerTrip = 0, pricePerCubicMeter = 0, incentives = {}, } = settings;
    const tripStats = calculateTrips(trips, {
        pricePerTrip,
        pricePerCubicMeter,
    });
    const hourStats = calculateHours(hours);
    const tripsSubtotal = payMode.byTrips ? tripStats.totalAmount : 0;
    const hoursSubtotal = payMode.byHours
        ? hourStats.totalHours * pricePerHour
        : 0;
    const incentive = incentives?.bonusMonthly || 0;
    const total = tripsSubtotal + hoursSubtotal + incentive;
    const empty = tripStats.totalTrips === 0 &&
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
    return {
        empty: false,
        trips: {
            count: tripStats.totalTrips,
            cubicMeters: tripStats.totalCubicMeters,
            subtotal: tripStats.totalAmount,
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
