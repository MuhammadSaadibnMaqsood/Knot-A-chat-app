import Conversation from "../model/Conversation.js";
import Message from "../model/Message.js";
import User from "../model/User.js";


export const getOrCreateConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  res.json(conversation);
};

export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all conversations where user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    }).sort({ updatedAt: -1 });

    // 2. Enrich conversations with other user + last message
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // find the other participant
        const otherUserId = conv.participants.find(
          (id) => id.toString() !== userId
        );

        const otherUser = await User.findById(otherUserId).select("-password");

        // get last message of this conversation
        const lastMessage = await Message.findOne({
          conversationId: conv._id,
        }).sort({ createdAt: -1 });

        return {
          _id: conv._id,
          participants: conv.participants,
          user: otherUser,
          lastMessage: lastMessage || null,
          updatedAt: conv.updatedAt,
        };
      })
    );

    res.json(enrichedConversations);
  } catch (error) {
    console.error("getUserConversations error:", error);
    res.status(500).json({ message: "Server error" });
  }
};