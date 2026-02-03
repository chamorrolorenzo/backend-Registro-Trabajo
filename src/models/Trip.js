import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
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

    remito: {
      type: String,
      required: true,
      trim: true,
    },

    cubicMeters: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Trip", tripSchema);
