import { memo, useState, useEffect } from 'react';
import { GameCard } from './GameCard';
import { GameCardSkeleton } from './GameCardSkeleton';

const PAGE_SIZE = 9;

export const GameList = memo(({ games, collection, loading, onAddToCollection }) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [games]);

  if (!loading && games.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(games.length / PAGE_SIZE);
  const paginatedGames = games.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="game-list">
      <h2 className="section-title">Search Results</h2>
      {loading ? (
        <div className="games-grid">
          {[1, 2, 3].map(i => <GameCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="games-grid">
            {paginatedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isAdded={collection.some(g => g.id === game.id)}
                onAdd={() => onAddToCollection(game)}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                &larr; Prev
              </button>
              <span className="pagination-info">Page {currentPage} of {totalPages}</span>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
});