import {
  Search,
  Plus,
  Loader2,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

// --- SKELETON COMPONENT ---
const ConversationSkeleton = () => (
  <div className="flex items-center gap-4 p-4 rounded-[2rem] animate-pulse">
    <div className="w-14 h-14 rounded-full bg-slate-200 flex-shrink-0" />
    <div className="flex-1 space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-3 bg-slate-100 rounded w-10" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-full" />
    </div>
  </div>
);

const ConversationList = ({
  conversations = [],
  activeId,
  onSelect,
  onNewChat,
  loading,
}) => {
  return (
    <div className="w-full h-full bg-white flex flex-col relative font-sans">
      {/* Header Section */}
      <div className="p-6 pb-2 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* The Chevron handles the back navigation via the parent's logic indirectly */}
            <div className="md:hidden">
               <ChevronLeft
                size={24}
                className="text-slate-400 cursor-pointer hover:text-slate-600"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Messages
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
        {loading ? (
          // Skeleton loading state
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-10">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <MessageSquare size={40} className="text-slate-300" />
            </div>
            <h3 className="text-slate-800 font-bold text-lg leading-tight">
              No conversations yet
            </h3>
            <p className="text-slate-400 text-sm mt-2">
              Start a new conversation to see it here.
            </p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = activeId === conv._id;
            return (
              <div
                key={conv._id}
                onClick={() => onSelect(conv)}
                className={`
                  flex items-center gap-4 p-4 rounded-[2rem] cursor-pointer transition-all duration-300 group
                  ${isActive 
                    ? "bg-blue-600 shadow-lg shadow-blue-200 translate-x-1" 
                    : "hover:bg-slate-50 hover:translate-x-1"}
                `}
              >
                {/* Gradient Avatar */}
                <div
                  className={`
                    w-14 h-14 rounded-full flex-shrink-0 bg-gradient-to-tr shadow-md flex items-center justify-center text-white font-bold text-lg ring-4 ring-white
                    ${getAvatarGradient(conv._id)}
                  `}
                >
                  {conv.user?.name?.charAt(0) || "?"}
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3
                      className={`font-bold truncate text-[15px] ${
                        isActive ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {conv.user?.name || "Unknown User"}
                    </h3>
                    {conv.lastMessage && (
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                        isActive ? "text-blue-100" : "text-slate-400"
                      }`}>
                        {formatDistanceToNow(
                          new Date(conv.lastMessage.createdAt),
                          { addSuffix: false }
                        )}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate font-medium ${
                    isActive ? "text-blue-50" : "text-slate-500"
                  }`}>
                    {conv.lastMessage?.text || "Start a conversation..."}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button (Glassmorphism style) */}
      <div className="sticky bottom-6 flex justify-center w-full pointer-events-none">
        <button
          onClick={onNewChat}
          className="pointer-events-auto cursor-pointer w-14 h-14 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
          <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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

export default ConversationList;