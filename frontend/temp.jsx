import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  LogOut,
  Send,
  MessageSquare,
  X,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { io } from "socket.io-client";

const API = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });

      setUser(data?.user);
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      console.log(username);
      const { data } = await API.post("/auth/signup", {
        username,
        email,
        password,
      });
      setUser(data?.user);
      return true;
    } catch (e) {
      toast.error(e.response?.data?.message || "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
      setUser(null);
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  return { user, loading, login, signup, logout };
};

const AuthScreen = ({ onLogin, onSignup, loading }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handle = async (e) => {
    e.preventDefault();
    if (mode === "login") {
      await onLogin(form.email, form.password);
    } else {
      await onSignup(form.name, form.email, form.password);
    }
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div style={styles.authWrap}>
      <div style={styles.authCard}>
        <div style={styles.authLogo}>
          <MessageSquare size={28} color="#60a5fa" />
          <span style={styles.authLogoText}>Convo</span>
        </div>
        <h2 style={styles.authTitle}>
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>
        <form onSubmit={handle} style={styles.form}>
          {mode === "signup" && (
            <input
              style={styles.input}
              placeholder="Full name"
              value={form.name}
              onChange={set("name")}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set("password")}
            required
          />
          <button style={styles.btnPrimary} type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="spin" />
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Sign up"
            )}
          </button>
        </form>
        <p style={styles.authSwitch}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <span
            style={styles.authLink}
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
};

const Avatar = ({ name = "", size = 36 }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const hue = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `hsl(${hue},50%,35%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 600,
        color: "#fff",
        flexShrink: 0,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {initials}
    </div>
  );
};

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

const SearchPanel = ({ onClose, onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await API.get(
        `/user/search?query=${encodeURIComponent(q)}`,
      );
      setResults(data);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  return (
    <div style={styles.searchPanel}>
      <div style={styles.searchHeader}>
        <span style={styles.searchTitle}>New conversation</span>
        <button style={styles.iconBtn} onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div style={styles.searchInputWrap}>
        <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
        <input
          autoFocus
          style={styles.searchInput}
          placeholder="Search by name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div style={styles.searchResults}>
        {loading && (
          <div style={styles.centerMsg}>
            <Loader2 size={18} className="spin" />
          </div>
        )}
        {!loading && results.length === 0 && query && (
          <div style={styles.centerMsg}>No users found</div>
        )}
        {results.map((u) => (
          <div
            key={u._id}
            style={styles.searchUser}
            onClick={() => onSelectUser(u)}
          >
            <Avatar name={u.name} size={32} />
            <div>
              <div style={styles.searchUserName}>{u.name}</div>
              <div style={styles.searchUserEmail}>{u.email}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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

export default function App() {
  const { user, loading: authLoading, login, signup, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [socketReady, setSocketReady] = useState(false);

  // ✅ Socket lives here — created once on login, passed down as prop
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io("http://localhost:3000", {
      query: { userId: user?._id },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setSocketReady(true); // ✅ IMPORTANT
    });
    socket.on("disconnect", () => {
      setSocketReady(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [user?._id]);

  useEffect(() => {
    const r = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setConvLoading(true);
    try {
      const { data } = await API.get("/con");
      setConversations(data);
    } catch {
      toast.error("Failed to load conversations");
    } finally {
      setConvLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = async (userObj) => {
    setShowSearch(false);
    try {
      const { data } = await API.post("/con", { receiverId: userObj._id });
      const enriched = { ...data, user: userObj };
      setConversations((prev) => {
        const exists = prev.find((c) => c._id === data._id);
        if (!exists) return [enriched, ...prev];
        return prev;
      });
      setActiveConv(enriched);
    } catch {
      toast.error("Could not open conversation");
    }
  };

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: "#1e293b", color: "#f1f5f9" } }}
        />
        <AuthScreen onLogin={login} onSignup={signup} loading={authLoading} />
      </>
    );
  }

  const showSidebar = !mobile || !activeConv;
  const showChat = !mobile || activeConv;

  return (
    <>
      <GlobalStyles />
      <Toaster
        position="top-right"
        toastOptions={{ style: { background: "#1e293b", color: "#f1f5f9" } }}
      />
      <div style={styles.app}>
        <div style={styles.appInner}>
          {showSearch && (
            <div style={styles.searchOverlay}>
              <SearchPanel
                onClose={() => setShowSearch(false)}
                onSelectUser={openConversation}
              />
            </div>
          )}

          {showSidebar && (
            <div
              style={{ ...styles.sidebarWrap, width: mobile ? "100%" : 300 }}
            >
              <div style={styles.userBar}>
                <Avatar name={user.name || user.email || "Me"} size={32} />
                <span style={styles.userBarName}>
                  {user.name || user.email}
                </span>
                <button
                  style={{ ...styles.iconBtn, marginLeft: "auto" }}
                  onClick={logout}
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
              <ConversationList
                conversations={conversations}
                activeId={activeConv?._id}
                onSelect={(c) => setActiveConv(c)}
                onNewChat={() => setShowSearch(true)}
                loading={convLoading}
              />
            </div>
          )}

          {showChat && (
            <div style={styles.chatWrap}>
              {mobile && activeConv && (
                <button
                  style={styles.backBtn}
                  onClick={() => setActiveConv(null)}
                >
                  <ChevronLeft size={18} /> Back
                </button>
              )}
              {/* ✅ socketRef passed as prop */}
              <ChatWindow
                conversation={activeConv}
                currentUser={user}
                socketRef={socketRef}
                socketReady={socketReady}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function GlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0a0f1a; color: #e2e8f0; font-family: 'IBM Plex Sans', sans-serif; }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
      @keyframes spin { to { transform: rotate(360deg); } }
      .spin { animation: spin 0.8s linear infinite; }
      input::placeholder { color: #475569; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

const styles = {
  app: {
    height: "100vh",
    display: "flex",
    alignItems: "stretch",
    background: "#0a0f1a",
  },
  appInner: {
    display: "flex",
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    position: "relative",
    height: "100%",
  },
  authWrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0a0f1a",
  },
  authCard: {
    width: 360,
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: "2.5rem 2rem",
  },
  authLogo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1.5rem",
  },
  authLogoText: {
    fontSize: 22,
    fontWeight: 600,
    color: "#f1f5f9",
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: -1,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: 500,
    color: "#f1f5f9",
    marginBottom: "1.5rem",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#f1f5f9",
    outline: "none",
    width: "100%",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  btnPrimary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "11px 0",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  authSwitch: {
    marginTop: "1.25rem",
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  authLink: { color: "#60a5fa", cursor: "pointer" },
  sidebarWrap: {
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #1e293b",
    height: "100%",
  },
  userBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderBottom: "1px solid #1e293b",
  },
  userBarName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#cbd5e1",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sidebar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 10px",
  },
  sidebarTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#f1f5f9",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  convList: { flex: 1, overflowY: "auto" },
  convItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #0f172a",
    transition: "background 0.15s",
  },
  convItemActive: { background: "#1e293b" },
  convInfo: { flex: 1, overflow: "hidden" },
  convName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#e2e8f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  convLast: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    marginTop: 2,
  },
  convTime: {
    fontSize: 11,
    color: "#475569",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  searchOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 320,
    background: "#0a0f1a",
    zIndex: 10,
    borderRight: "1px solid #1e293b",
    display: "flex",
    flexDirection: "column",
  },
  searchPanel: { display: "flex", flexDirection: "column", height: "100%" },
  searchHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #1e293b",
  },
  searchTitle: { fontSize: 14, fontWeight: 500, color: "#e2e8f0" },
  searchInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    margin: 12,
    background: "#1e293b",
    borderRadius: 8,
    border: "1px solid #334155",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "#f1f5f9",
    width: "100%",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  searchResults: { flex: 1, overflowY: "auto" },
  searchUser: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #0f172a",
  },
  searchUserName: { fontSize: 13, fontWeight: 500, color: "#e2e8f0" },
  searchUserEmail: { fontSize: 11, color: "#64748b" },
  chatWrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatWindow: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 20px",
    borderBottom: "1px solid #1e293b",
  },
  chatHeaderName: { fontSize: 15, fontWeight: 500, color: "#f1f5f9" },
  chatHeaderSub: { fontSize: 12, color: "#22c55e", marginTop: 1 },
  messagesArea: { flex: 1, overflowY: "auto", padding: "20px 24px" },
  bubble: {
    padding: "9px 14px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  bubbleOwn: {
    background: "#2563eb",
    color: "#fff",
    borderBottomRightRadius: 3,
  },
  bubblePeer: {
    background: "#1e293b",
    color: "#e2e8f0",
    borderBottomLeftRadius: 3,
  },
  msgTime: { fontSize: 11, color: "#475569", marginTop: 3, paddingInline: 2 },
  chatInput: {
    display: "flex",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid #1e293b",
    alignItems: "center",
  },
  msgInput: {
    flex: 1,
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    color: "#f1f5f9",
    outline: "none",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  sendBtn: {
    background: "#2563eb",
    border: "none",
    borderRadius: 10,
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    flexShrink: 0,
  },
  noChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#475569",
    fontSize: 14,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "3rem 1rem",
    color: "#475569",
    fontSize: 13,
    textAlign: "center",
  },
  centerMsg: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
    color: "#475569",
    fontSize: 13,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: 13,
    cursor: "pointer",
    padding: "10px 16px",
    borderBottom: "1px solid #1e293b",
  },
};



// This is my overall frontend I want to dividethis code in component and want to use react router dom for routing in login/sign ap and other pages can you it for me ???????