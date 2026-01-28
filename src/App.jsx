import { useState, useCallback, useEffect, useMemo } from 'react';
import { GameSearch } from './components/GameSearch';
import { GameList } from './components/GameList';
import { DigitalShelf } from './components/DigitalShelf';
import { ImportExportModal } from './components/ImportExportModal';
import { useGameCollection } from './hooks/useGameCollection';
import { searchGames, getGameDetails } from './utils/bggApi';
import bggLogo from './assets/powered_by_BGG_04_XL.png';
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
    return;
  }

  setLoading(true);
  setError('');

  try {
    const basicResults = await searchGames(query);

    const filteredResults = basicResults.filter(game => 
      game.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredResults.length === 0) {
      setSearchResults([]);
      setError(`No games found that exactly match "${query}".`);
      return;
    }

    const prioritizedResults = filteredResults.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(query.toLowerCase());
      const bStarts = b.name.toLowerCase().startsWith(query.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

    const gameIds = prioritizedResults.slice(0, 20).map(game => game.id);
    const detailedGames = await getGameDetails(gameIds);
    
    setSearchResults(detailedGames);
  } catch (err) {
    setError('Search failed.');
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
        <p className="app-subtitle">- Your digital board game shelf -</p>
        <p className="app-description">All games are saved only in this browser. Remember to back up your collection regularly!</p>
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
        <a href="https://boardgamegeek.com" target="_blank" rel="noopener noreferrer"><img src={bggLogo} alt="Powered by BoardGameGeek" width="250" /></a>
        <p className='credits'>Made by <a href="https://frontend-erik.se" target="_blank" rel="noopener noreferrer">Erik Karlsson</a></p>
      </footer>
    </div>
  );
}

export default App;