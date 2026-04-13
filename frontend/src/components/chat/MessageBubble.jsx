
const MessageBubble = ({ msg, isOwn }) => (
  <div
    style={{
      display: "flex",
      justifyContent: isOwn ? "flex-end" : "flex-start",
      marginBottom: 8,
    }}
  >
    <div style={{ maxWidth: "70%" }}>
      <div
        style={{
          ...styles.bubble,
          ...(isOwn ? styles.bubbleOwn : styles.bubblePeer),
        }}
      >
        {msg.text || msg.message}
      </div>
      <div style={{ ...styles.msgTime, textAlign: isOwn ? "right" : "left" }}>
        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
      </div>
    </div>
  </div>
);

export default MessageBubble;