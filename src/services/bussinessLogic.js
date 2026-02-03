function getBusinessLogic(paymentMode) {
  return {
    countHours: paymentMode === "horas" || paymentMode === "ambos",
    countTrips: paymentMode === "viajes" || paymentMode === "ambos",
  };
}

module.exports = { getBusinessLogic };
