const ConversationList = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  loading,
}) => (
  <div style={styles.sidebar}>
    <div style={styles.sidebarHeader}>
      <span style={styles.sidebarTitle}>Messages</span>
      <button style={styles.iconBtn} onClick={onNewChat} title="New chat">
        <Search size={18} />
      </button>
    </div>
    <div style={styles.convList}>
      {loading && (
        <div style={styles.centerMsg}>
          <Loader2 size={20} className="spin" />
        </div>
      )}
      {!loading && conversations.length === 0 && (
        <div style={styles.emptyState}>
          <MessageSquare size={32} color="#475569" />
          <p>No conversations yet</p>
          <span>Search for someone to start chatting</span>
        </div>
      )}
      {conversations.map((conv) => (
        <div
          key={conv._id}
          style={{
            ...styles.convItem,
            ...(activeId === conv._id ? styles.convItemActive : {}),
          }}
          onClick={() => onSelect(conv)}
        >
          <Avatar name={conv.user?.name || "?"} />
          <div style={styles.convInfo}>
            <div style={styles.convName}>{conv.user?.name || "Unknown"}</div>
          </div>
          {conv.lastMessage && (
            <span style={styles.convTime}>
              {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                addSuffix: false,
              })}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default ConversationList;