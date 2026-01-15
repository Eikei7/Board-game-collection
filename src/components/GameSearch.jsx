import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';

export function GameSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    await onSearch(query);
    setLoading(false);
  }, [query, onSearch]);

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
        <button 
          onClick={handleSubmit}
          disabled={loading || !query.trim()}
          className="search-button"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
        </button>
      </div>
    </div>
  );
}