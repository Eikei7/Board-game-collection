import { GameCard } from './GameCard';

export function GameList({ games, collection, onAddToCollection }) {
  return (
    <div className="game-list">
      <h2 className="section-title">Search Results</h2>
      {games.length === 0 ? (
        <p className="no-results">No games found. Try searching!</p>
      ) : (
        <div className="games-grid">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isAdded={collection.some(g => g.id === game.id)}
              onAdd={() => onAddToCollection(game)}
            />
          ))}
        </div>
      )}
    </div>
  );
}