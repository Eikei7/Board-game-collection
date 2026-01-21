import { useState, useCallback, useEffect, useMemo } from 'react';
import { GameSearch } from './components/GameSearch';
import { GameList } from './components/GameList';
import { DigitalShelf } from './components/DigitalShelf';
import { ImportExportModal } from './components/ImportExportModal';
import { useGameCollection } from './hooks/useGameCollection';
import { searchGames, getGameDetails } from './utils/bggApi';
import './App.css';

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState('');
  const { collection, addGame, removeGame, importCollection } = useGameCollection();

  useEffect(() => {
    const handleImportEvent = (e) => {
      setPendingImportData(JSON.stringify(e.detail.games, null, 2));
      setShowImportModal(true);
    };

    window.addEventListener('importGames', handleImportEvent);
    return () => window.removeEventListener('importGames', handleImportEvent);
  }, []);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError('');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError('');
    setSearchResults([]); 
    
    try {
      const basicResults = await searchGames(query);
      
      if (basicResults.length === 0) {
        setSearchResults([]); 
        setError('No games found. Try a different search.');
        return;
      }

      const gameIds = basicResults.slice(0, 10).map(game => game.id);
      const detailedGames = await getGameDetails(gameIds);
      
      setSearchResults(detailedGames);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const [sortOrder, setSortOrder] = useState('name-asc');

const sortedCollection = useMemo(() => {
  return [...collection].sort((a, b) => {
    if (sortOrder === 'name-asc') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });
}, [collection, sortOrder]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `board-game-collection-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [collection]);

  const handleImportConfirm = (games) => {
    importCollection(games);
    setShowImportModal(false);
    setPendingImportData('');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Board Game Collection</h1>
        <p className="app-subtitle">Your digital board game shelf</p>
      </header>

      <main className="app-main">
        <div className="search-section">
          <GameSearch onSearch={handleSearch} />
          
          {error && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem',
              background: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </div>

        <GameList
          games={searchResults}
          collection={collection}
          loading={loading}
          onAddToCollection={addGame}
        />
        
        <DigitalShelf
          collection={sortedCollection}
          onRemoveFromCollection={removeGame}
          onExport={handleExport}
          onSortChange={setSortOrder}
          currentSort={sortOrder}
        />

        <ImportExportModal
          isOpen={showImportModal}
          data={pendingImportData}
          onClose={() => {
            setShowImportModal(false);
            setPendingImportData('');
          }}
          onImport={handleImportConfirm}
        />
      </main>

      <footer className="app-footer">
        <p>Data provided by BoardGameGeek API</p>
        <p>All data stored locally in your browser</p>
      </footer>
    </div>
  );
}

export default App;