import { useState, useCallback } from 'react';
import { GameSearch } from './components/GameSearch';
import { GameList } from './components/GameList';
import { DigitalShelf } from './components/DigitalShelf';
import { ImportExport } from './components/ImportExport';
import { useGameCollection } from './hooks/useGameCollection';
import './App.css';

// Mock games for development - replace with actual API calls when ready
const MOCK_GAMES = [
  {
    id: '174430',
    name: 'Gloomhaven',
    yearpublished: '2017',
    minplayers: '1',
    maxplayers: '4',
    minplaytime: '60',
    maxplaytime: '120',
    thumbnail: 'https://cf.geekdo-images.com/micro/img/da9h6q5n1foccN4-vfLm0CYvYmg=/fit-in/64x64/pic2437871.jpg'
  },
  {
    id: '169786',
    name: 'Scythe',
    yearpublished: '2016',
    minplayers: '1',
    maxplayers: '5',
    minplaytime: '90',
    maxplaytime: '115',
    thumbnail: 'https://cf.geekdo-images.com/micro/img/3cQgH9qJVqXNW_2mDacEToVRCkw=/fit-in/64x64/pic3163924.jpg'
  },
  {
    id: '167791',
    name: 'Terraforming Mars',
    yearpublished: '2016',
    minplayers: '1',
    maxplayers: '5',
    minplaytime: '120',
    maxplaytime: '180',
    thumbnail: 'https://cf.geekdo-images.com/micro/img/FbatK_sqZiW6XpCe8N-VJLREjnE=/fit-in/64x64/pic3536616.jpg'
  },
  {
    id: '224517',
    name: 'Wingspan',
    yearpublished: '2019',
    minplayers: '1',
    maxplayers: '5',
    minplaytime: '40',
    maxplaytime: '70',
    thumbnail: 'https://cf.geekdo-images.com/micro/img/EGJf3vxOzSP9ZX57208Kzxa6ibA=/fit-in/64x64/pic4458123.jpg'
  }
];

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { collection, addGame, removeGame, importCollection } = useGameCollection();

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call - replace with actual API when you get access
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = MOCK_GAMES.filter(game =>
        game.name.toLowerCase().includes(query.toLowerCase())
      );
      
      if (results.length === 0) {
        setSearchResults([]);
        setError('No games found. Try a different search.');
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        
        <ImportExport
          collection={collection}
          onImport={importCollection}
        />
        
        <DigitalShelf
          collection={collection}
          onRemoveFromCollection={removeGame}
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