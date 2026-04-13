import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getMessages } from "../controller/message.controller.js";

const messageRoutes = express.Router();
messageRoutes.get(
  "/:conversationId",
  protect,
  getMessages,
);
export default messageRoutes;
