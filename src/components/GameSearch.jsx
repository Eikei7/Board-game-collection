import { useState, useCallback, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';

export function GameSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = useCallback(async () => {
    if (!query.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    await onSearch(query);
    setLoading(false);
    submittingRef.current = false;
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="search-container">
      <div className="search-form">
  <div className="search-input-group">
    <Search className="search-icon" size={20} />
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={handleKeyPress}
      placeholder="Search for board games..."
      className="search-input"
    />
  </div>

  <div className="search-button-row">
    <button 
      onClick={handleSubmit}
      disabled={loading || !query.trim()}
      className="search-button"
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
    </button>

    <button 
      type="button"
      onClick={handleClear}
      disabled={loading || !query}
      className="clear-button"
    >
      <X size={20} /> Clear
    </button>
  </div>
</div>
    </div>
  );
}