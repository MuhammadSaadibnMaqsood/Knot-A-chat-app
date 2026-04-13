import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import { connectDB } from "./config/db.js";
import { limiter, securityHeaders } from "./middleware/security.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import { initSocket } from "./socket/socket.js";
import http from "http";
import userRoutes from "./routes/user.route.js";
import conversationRoutes from "./routes/conversation.route.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";

const app = express();
connectDB();

const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // your React dev server port (Vite default)
    credentials: true, // lowercase 'd', not 'Credential'
  }),
);
// Initialize socket
initSocket(server);

// MIDDLEWARES
app.use(cookieParser());
app.use(express.json());
app.use(securityHeaders);
// app.use(sanitizeData);
app.use("/api", limiter);

app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/con", conversationRoutes);
app.use("/api/message", messageRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`APP IS LISTENT ON PORT ${PORT}`);
});
