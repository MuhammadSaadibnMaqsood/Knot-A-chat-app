import React, { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, UserPlus } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
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
    <div className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl border-r border-slate-100">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            New Chat
          </h1>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="relative group">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            autoFocus
            type="text"
            placeholder="Search by name or email..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-500" />
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="text-center py-10 text-slate-400 italic">
            No users found for "{query}"
          </div>
        )}

        {results.map((u) => (
          <div
            key={u._id}
            onClick={() => onSelectUser(u)}
            className="flex items-center gap-4 p-4 rounded-[2rem] cursor-pointer hover:bg-blue-50 transition-all group"
          >
            {/* Avatar matching the app theme */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              {u.name.charAt(0)}
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {u.name}
              </h3>
              <p className="text-xs text-slate-400 font-medium">{u.email}</p>
            </div>

            <UserPlus
              size={18}
              className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
export default SearchPanel;
