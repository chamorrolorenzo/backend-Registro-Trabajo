import "dotenv/config";

console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS);

import app from "./app.js";
import connectDB from "./config/Db.js";

const PORT = process.env.PORT || 3002;

await connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor en escucha en http://localhost:${PORT}`);
});
