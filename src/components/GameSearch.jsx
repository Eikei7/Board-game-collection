import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export function GameSearch({ onSearch }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    await onSearch(query);
    setLoading(false);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <Search className="search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for board games..."
            className="search-input"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="search-button"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Search'}
        </button>
      </form>
    </div>
  );
}