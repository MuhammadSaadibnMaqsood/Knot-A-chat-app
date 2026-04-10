import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import { connectDB } from "./config/db.js";
import {
  limiter,
  sanitizeData,
  securityHeaders,
} from "./middleware.js/security.js";

const app = express();
connectDB();

// MIDDLEWARES
app.use(securityHeaders);
app.use(sanitizeData);
app.use(express.json());
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`APP IS LISTENT ON PORT ${PORT}`);
});
