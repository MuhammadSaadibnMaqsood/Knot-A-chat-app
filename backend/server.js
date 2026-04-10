import { configDotenv } from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
configDotenv();
const app = express();
connectDB();
app.get("/", (req, res) => {
  res.send("HELLO WORLD");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`APP IS LISTENT ON PORT ${PORT}`);
});
