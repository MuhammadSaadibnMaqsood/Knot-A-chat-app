import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import ChatWindow from "../components/chat/ChatWindow";
import SearchPanel from "../components/chat/SearchPanel";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ConversationList from "../components/chat/ConversationList";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user, logout } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [socketReady, setSocketReady] = useState(false);

  const socketRef = useRef(null);

  // --- LOGIC (KEEPING AS IS) ---
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
      query: { userId: user?._id },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketReady(true);
    });

    return () => socket.disconnect();
  }, [user]);

  const loadConversations = useCallback(async () => {
    const { data } = await API.get("/con/");
    setConversations(data);
    console.log("debugging chat page: ", data);
  }, []); // Added missing dependency array

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

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR: Conversation List */}
      <div
        className={`${
          activeConv ? "hidden" : "block"
        } md:block w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white h-full`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConv?._id}
          onSelect={setActiveConv}
          onNewChat={() => setShowSearch(true)}
        />
      </div>

      {/* RIGHT SIDE: Chat Window */}
      <div
        className={`${
          !activeConv ? "hidden" : "flex"
        } md:flex flex-1 flex-col h-full bg-white relative`}
      >
        {activeConv ? (
          <>
            {/* Mobile Header with Back Button */}
            <div className="md:hidden flex items-center p-4 border-b bg-white">
              <button
                onClick={() => setActiveConv(null)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
              </button>
              <div className="font-semibold text-gray-800">
                {activeConv.user?.username || "Chat"}
              </div>
            </div>

            <ChatWindow
              conversation={activeConv}
              currentUser={user}
              socketRef={socketRef}
              socketReady={socketReady}
            />
          </>
        ) : (
          /* Desktop Empty State */
          <div className="hidden md:flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">
              Pick a friend from the list to start chatting
            </p>
          </div>
        )}
      </div>

      {/* SEARCH PANEL OVERLAY */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          />
          {/* Panel Container */}
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <SearchPanel
              onClose={() => setShowSearch(false)}
              onSelectUser={openConversation}
            />
          </div>
        </div>
      )}
    </div>
  );
}
