import express from "express"

const userRoutes = express.Router()

userRoutes.get("/search", protect, searchUsers);

export default userRoutes