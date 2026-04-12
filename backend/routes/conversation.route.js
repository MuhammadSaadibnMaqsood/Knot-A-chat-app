import express from "express"
import protect from "../middleware/authMiddleware.js";
import { getOrCreateConversation, getUserConversations } from "../controller/conversation.controller.js";

const conversationRoutes = express.Router()

conversationRoutes.post("/", protect, getOrCreateConversation);
conversationRoutes.get("/", protect, getUserConversations);
export default conversationRoutes