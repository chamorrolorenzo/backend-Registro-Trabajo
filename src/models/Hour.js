import mongoose from "mongoose";

const hourSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // Día laboral (normalizado a 00:00)
    date: {
      type: Date,
      required: true,
    },

    // Timestamps reales
    entryTime: {
      type: Date,
      required: true,
    },

    exitTime: {
      type: Date,
      default: null,
    },

    // Minutos totales trabajados
    totalMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hour", hourSchema);
