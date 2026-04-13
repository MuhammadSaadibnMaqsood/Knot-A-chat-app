import express from "express";
import { login, logout, signup } from "../controller/auth.controller.js";
import protect from "../middleware/authMiddleware.js";

const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

export default authRoutes