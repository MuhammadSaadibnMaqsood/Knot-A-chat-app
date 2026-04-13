import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Plus,
  Send,
  Loader2,
  MessageSquare,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import API from "../../api/axios";
import toast from "react-hot-toast";

// Matches the gradient logic from ConversationList for consistency
const getAvatarGradient = (id) => {
  const gradients = [
    "from-cyan-400 to-blue-500",
    "from-indigo-400 to-purple-500",
    "from-blue-600 to-blue-800",
    "from-pink-400 to-rose-500",
    "from-orange-400 to-red-500",
  ];
  const index = id ? id.length % gradients.length : 0;
  return gradients[index];
};

const ChatWindow = ({
  conversation,
  currentUser,
  socketRef,
  socketReady,
  onBack, // Received from ChatPage
}) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // --- LOGIC (UNTOUCHED) ---
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

  // --- UI RENDERING ---

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 text-slate-400 p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-6 animate-bounce duration-[3000ms]">
          <MessageSquare size={40} className="text-blue-500/30" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Your Messages</h3>
        <p className="max-w-xs mt-2 text-sm leading-relaxed">
          Select a contact from the list to start a conversation or view your
          history.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          {/* Back Button (Only logic call is onBack) */}
          {/* <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
          >
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button> */}

          {/* User Info with Avatar */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-tr shadow-md flex items-center justify-center text-white font-bold text-base md:text-lg ${getAvatarGradient(conversation._id)}`}
            >
              {conversation.user?.name?.charAt(0) || "?"}
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-800 leading-none mb-1">
                {conversation.user?.name || "Chat"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 md:gap-4">
          <button className="hidden sm:flex cursor-pointer p-2 text-slate-400 hover:text-blue-500 transition-colors">
            <Phone size={20} />
          </button>
          <button className="hidden sm:flex p-2 cursor-pointer text-slate-400 hover:text-blue-500 transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 text-slate-400 cursor-pointer hover:text-blue-500 transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 bg-[#f8fafc] custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              Securing connection...
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
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
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Footer Input */}
      <footer className="p-4 md:p-6 bg-white border-t border-slate-100">
        <form
          onSubmit={send}
          className="max-w-4xl mx-auto flex items-center gap-2 md:gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-200/50 shadow-sm focus-within:shadow-md focus-within:bg-white transition-all duration-300"
        >
          <button
            type="button"
            className="p-3 text-slate-400 cursor-pointer hover:text-blue-600 hover:bg-white rounded-full transition-all flex-shrink-0"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent border-none py-2 px-1 text-sm md:text-base focus:ring-0 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            placeholder="Write a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className={`p-3 rounded-full cursor-pointer transition-all duration-300 flex-shrink-0 shadow-lg ${
              text.trim()
                ? "bg-blue-600 text-white scale-100 rotate-0 shadow-blue-200"
                : "bg-slate-200 text-slate-400 scale-90 -rotate-12 opacity-50"
            }`}
          >
            <Send
              size={20}
              strokeWidth={2.5}
              fill="currentColor"
              fillOpacity={0.2}
            />
          </button>
        </form>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
