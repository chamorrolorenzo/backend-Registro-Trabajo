import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    // Nombre legal / comercial
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    //  CUIT (obligatorio)
    cuit: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // 🖼️ Logo ( o URL a futuro)
    logo: {
      type: String,
      default: null,
    },

    // Configuración de negocio
    settings: {
      //  Forma de pago
      payMode: {
        byHours: {
          type: Boolean,
          default: false,
        },
        byTrips: {
          type: Boolean,
          default: false,
        },
      },

      //  Pago por horas
      pricePerHour: {
        type: Number,
        default: 0,
      },

      // Pago por viajes
      pricePerTrip: {
        type: Number,
        default: 0,
      },

      // Pago por metro cúbico
      pricePerCubicMeter: {
        type: Number,
        default: 0,
      },

      currency: {
        type: String,
        enum: ['ARS', 'USD'],
        default: 'ARS',
      },

      // Incentivos / multiplicadores
      incentives: {
        bonusMonthly: {
          type: Number,
          default: 0,
        },
      },
   
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Company ||
  mongoose.model("Company", companySchema);
