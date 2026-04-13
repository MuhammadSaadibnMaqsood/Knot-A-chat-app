const ChatWindow = ({ conversation, currentUser, socketRef, socketReady }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socketRef?.current || !conversation?._id) return;

    const socket = socketRef.current;

    const handleReceive = (newMsg) => {
      if (newMsg.conversationId?.toString() !== conversation._id?.toString())
        return;
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === newMsg._id);
        return exists ? prev : [...prev, newMsg];
      });
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [conversation?._id, socketRef]);

  // Load message history via REST GET
  useEffect(() => {
    if (!conversation?._id) return;
    setLoading(true);
    API.get(`/message/${conversation._id}`)
      .then(({ data }) => setMessages(data))
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false));
  }, [conversation?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    console.log("SEND FIRE ");

    console.log("Socket:", socketRef.current);
    console.log("Ready:", socketReady);

    if (!socketReady || !socketRef.current) {
      toast.error("Socket not connected yet");
      return;
    }

    if (!text.trim()) return;

    const payload = text.trim();
    setText("");

    const receiverId = conversation.user?._id;

    const optimistic = {
      _id: Date.now().toString(),
      senderId: currentUser._id,
      receiverId,
      text: payload,
      message: payload,
      conversationId: conversation._id,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    socketRef.current.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId,
      message: payload,
      conversationId: conversation._id,
    });
  };

  if (!conversation) {
    return (
      <div style={styles.noChat}>
        <MessageSquare size={48} color="#334155" />
        <p>Select a conversation</p>
      </div>
    );
  }

  return (
    <div style={styles.chatWindow}>
      <div style={styles.chatHeader}>
        <Avatar name={conversation.user?.name || "?"} />
        <div>
          <div style={styles.chatHeaderName}>{conversation.user?.name}</div>
          <div style={styles.chatHeaderSub}>Active now</div>
        </div>
      </div>

      <div style={styles.messagesArea}>
        {loading && (
          <div style={styles.centerMsg}>
            <Loader2 size={20} className="spin" />
          </div>
        )}
        {!loading && messages?.length === 0 && (
          <div style={styles.centerMsg}>No messages yet. Say hello!</div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            msg={msg}
            isOwn={
              msg.senderId === currentUser?._id ||
              msg.senderId?._id === currentUser?._id
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <form style={styles.chatInput} onSubmit={send}>
        <input
          style={styles.msgInput}
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button style={styles.sendBtn} type="submit" disabled={!text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
