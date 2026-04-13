
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

export default SearchPanel;