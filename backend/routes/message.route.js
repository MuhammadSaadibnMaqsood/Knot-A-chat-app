import express from "express";

const messageRoutes = express.Router();
messageRoutes.get("/:conversationId", protect, getMessages);
export default userRoutes;
