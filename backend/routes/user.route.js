import express from "express"
import protect from "../middleware/authMiddleware.js";
import { searchUsers } from "../controller/user.controller.js";

const userRoutes = express.Router()

userRoutes.get("/search", protect, searchUsers);

export default userRoutes