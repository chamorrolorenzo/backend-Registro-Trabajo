type PaymentMode = "horas" | "viajes" | "ambos";

export function getBusinessLogic(paymentMode: PaymentMode) {
  return {
    countHours: paymentMode === "horas" || paymentMode === "ambos",
    countTrips: paymentMode === "viajes" || paymentMode === "ambos",
  };
}
