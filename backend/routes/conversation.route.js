import express from "express"

const conversationRoutes = express.Router()

conversationRoutes.post("/", protect, getOrCreateConversation);
conversationRoutes.get("/", protect, getUserConversations);
export default conversationRoutes