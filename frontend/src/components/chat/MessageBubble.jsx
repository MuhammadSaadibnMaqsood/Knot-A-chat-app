import { formatDistanceToNow } from "date-fns";

const MessageBubble = ({ msg, isOwn }) => {
  // Determine date display - logic untouched
  const timeLabel = msg.createdAt
    ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false })
    : "Just now";

  return (
    <div
      className={`flex w-full mb-1 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] md:max-w-[70%] flex flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* Message Content */}
        <div
          className={`
            relative px-4 py-2.5 text-[14.5px] leading-relaxed shadow-sm transition-all duration-200
            ${
              isOwn
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[1.2rem] rounded-tr-[0.2rem] hover:shadow-md hover:shadow-blue-200"
                : "bg-white border border-slate-100 text-slate-700 rounded-[1.2rem] rounded-tl-[0.2rem] hover:border-slate-200 hover:shadow-sm"
            }
          `}
        >
          <p className="font-medium">{msg.text || msg.message}</p>
        </div>

        {/* Timestamp & Status */}
        <div
          className={`flex items-center gap-1.5 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {timeLabel}
          </span>

          {isOwn && (
            <div className="flex">
              {/* Subtle double-check mark icon for "interesting" UI */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-500"
              >
                <path d="M18 6 7 17l-5-5" />
                <path d="m22 10-7.5 7.5L13 16" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
