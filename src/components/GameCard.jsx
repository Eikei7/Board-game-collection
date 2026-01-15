import { Plus, Check } from 'lucide-react';

export function GameCard({ game, onAdd, isAdded }) {
  return (
    <div className="game-card">
      {game.thumbnail && (
        <img 
          src={game.thumbnail} 
          alt={game.name}
          className="game-thumbnail"
        />
      )}
      <div className="game-info">
        <h3 className="game-title">{game.name}</h3>
        {game.yearpublished && (
          <p className="game-year">Published: {game.yearpublished}</p>
        )}
        <p className="game-players">
          Players: {game.minplayers}-{game.maxplayers}
        </p>
        <p className="game-time">
          Play Time: {game.minplaytime}-{game.maxplaytime} mins
        </p>
      </div>
      <button
        onClick={() => onAdd(game)}
        disabled={isAdded}
        className={`add-button ${isAdded ? 'added' : ''}`}
      >
        {isAdded ? <Check /> : <Plus />}
        {isAdded ? 'Added' : 'Add to Collection'}
      </button>
    </div>
  );
}