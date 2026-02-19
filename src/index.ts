import "dotenv/config";
import app from "./App.js";
import connectDB from "./config/Db.js";

const PORT = Number(process.env.PORT) || 3002;

async function start() {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor en escucha en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("ERROR AL INICIAR:", err);
  }
}

start();
