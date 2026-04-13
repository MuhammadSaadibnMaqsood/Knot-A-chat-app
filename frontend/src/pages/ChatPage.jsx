import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ConversationList from "../components/chat/ConversationList";
import ChatWindow from "../components/chat/ChatWindow";
import SearchPanel from "../components/chat/SearchPanel";
import API from "../api/axios";
import useAuth from "../hooks/auth";

export default function ChatPage() {
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);

  // SOCKET
  useEffect(() => {
    if (!user?._id) return;

    const socket = io("http://localhost:3000", {
      query: { userId: user._id },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketReady(true);
    });

    return () => socket.disconnect();
  }, [user]);

  // Load conversations
  const loadConversations = useCallback(async () => {
    const { data } = await API.get("/con");
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <ConversationList
        conversations={conversations}
        activeId={activeConv?._id}
        onSelect={setActiveConv}
        onNewChat={() => setShowSearch(true)}
      />

      <ChatWindow
        conversation={activeConv}
        currentUser={user}
        socketRef={socketRef}
        socketReady={socketReady}
      />

      {showSearch && (
        <SearchPanel
          onClose={() => setShowSearch(false)}
          onSelectUser={(u) => {
            setActiveConv(u);
            setShowSearch(false);
          }}
        />
      )}
    </div>
  );
}
