import { useState } from 'react';
import { GameSearch } from './components/GameSearch';
import { GameList } from './components/GameList';
import { DigitalShelf } from './components/DigitalShelf';
import { ImportExport } from './components/ImportExport';
import { useLocalStorage } from './hooks/useLocalStorage';
import { searchGames } from './utils/bggApi';
import xml2js from 'xml2js';

// Mock data for development (remove when using real API)
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
  }
];

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [collection, setCollection] = useLocalStorage('boardGameCollection', []);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
  setLoading(true);
  
  try {
    const searchResults = await searchGames(query);
    
    // Optionally get detailed info for each game
    if (searchResults.length > 0) {
      const gameIds = searchResults.map(game => game.id);
      const detailedGames = await getGameDetails(gameIds);
      setSearchResults(detailedGames);
    } else {
      setSearchResults([]);
    }
  } catch (error) {
    console.error('Search error:', error);
    setSearchResults([]);
  } finally {
    setLoading(false);
  }
};

  const handleAddToCollection = (game) => {
    if (!collection.some(g => g.id === game.id)) {
      setCollection([...collection, game]);
    }
  };

  const handleRemoveFromCollection = (gameId) => {
    setCollection(collection.filter(game => game.id !== gameId));
  };

  const handleImport = (importedCollection) => {
    setCollection(importedCollection);
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
          {loading && <p className="loading-text">Searching...</p>}
        </div>

        <div className="content-grid">
          <div className="left-panel">
            <GameList
              games={searchResults}
              collection={collection}
              onAddToCollection={handleAddToCollection}
            />
          </div>
          
          <div className="right-panel">
            <DigitalShelf
              collection={collection}
              onRemoveFromCollection={handleRemoveFromCollection}
            />
            <ImportExport
              collection={collection}
              onImport={handleImport}
            />
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Data provided by BoardGameGeek API</p>
        <p>All data stored locally in your browser</p>
      </footer>
    </div>
  );
}

export default App;