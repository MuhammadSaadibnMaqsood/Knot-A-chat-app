import Message from "../model/Message.js";

export const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  const messages = await Message.find({ conversationId }).sort({
    createdAt: 1,
  });

  res.json(messages);
};
