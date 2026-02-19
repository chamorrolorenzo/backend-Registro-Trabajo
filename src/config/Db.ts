import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.error("❌ MONGO_URI no está definida en el .env");
    process.exit(1);
  }

  try {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB conectado");
} catch (error) {
  if (error instanceof Error) {
    console.error("❌ Error MongoDB:", error.message);
  } else {
    console.error("❌ Error MongoDB desconocido");
  }
  process.exit(1);
}

};

export default connectDB;
