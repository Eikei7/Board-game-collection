import { memo } from 'react';
import { GameCard } from './GameCard';
import { GameCardSkeleton } from './GameCardSkeleton';

export const GameList = memo(({ games, collectionIds, loading, onAddToCollection }) => {
  if (!loading && games.length === 0) {
    return null;
  }

  return (
    <div className="game-list">
      <h2 className="section-title">Search Results</h2>
      {loading ? (
        <div className="games-grid">
          {[1, 2, 3].map(i => <GameCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isAdded={collectionIds.has(game.id)}
              onAdd={() => onAddToCollection(game)}
            />
          ))}
        </div>
      )}
    </div>
  );
});