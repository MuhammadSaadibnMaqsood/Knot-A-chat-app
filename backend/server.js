import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import { connectDB } from "./config/db.js";
import { limiter, securityHeaders } from "./middleware.js/security.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import { initSocket } from "./socket/socket.js";
import http from "http";

const app = express();
connectDB();

const server = http.createServer(app);

// Initialize socket
initSocket(server);

// MIDDLEWARES
app.use(cookieParser());
app.use(securityHeaders);
app.use(express.json());
// app.use(sanitizeData);
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.use("/api/user", authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`APP IS LISTENT ON PORT ${PORT}`);
});
