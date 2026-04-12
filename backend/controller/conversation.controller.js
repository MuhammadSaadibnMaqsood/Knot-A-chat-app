import Conversation from "../model/Conversation.js";


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
