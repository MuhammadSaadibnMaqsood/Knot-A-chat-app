import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import { connectDB } from "./config/db.js";
import {
  limiter,
  securityHeaders,
} from "./middleware.js/security.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/auth.route.js";

const app = express();
connectDB();

// MIDDLEWARES
app.use(cookieParser());
app.use(securityHeaders);
app.use(express.json());
// app.use(sanitizeData);
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.use("/api/user", userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`APP IS LISTENT ON PORT ${PORT}`);
});
