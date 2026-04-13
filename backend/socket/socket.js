import { Server } from "socket.io";
import Message from "../model/Message.js";

const userSocketMap = new Map();

export const initSocket = (server) => {
   const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL, 
      credentials: true,            
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log("Socket debugging: ",userId);
    

    if (userId) {
      userSocketMap.set(userId, socket.id);
    }

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, conversationId } = data;

      const newMessage = await Message.create({
        senderId,
        receiverId,
        message,
        conversationId,
      });

      const receiverSocketId = userSocketMap.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newMessage);
      }
    });

    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
    });
  });
};
