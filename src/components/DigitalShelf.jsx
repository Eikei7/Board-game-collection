import { Trash2 } from 'lucide-react';

export function DigitalShelf({ collection, onRemoveFromCollection }) {
  return (
    <div className="digital-shelf">
      <div className="shelf-header">
        <h2 className="section-title">Your Collection ({collection.length})</h2>
        {collection.length > 0 && (
          <p className="shelf-subtitle">Click on a game to remove it</p>
        )}
      </div>
      
      {collection.length === 0 ? (
        <div className="empty-shelf">
          <p>Your shelf is empty!</p>
          <p>Search for games above to start building your collection.</p>
        </div>
      ) : (
        <div className="collection-grid">
          {collection.map((game) => (
            <div 
              key={game.id} 
              className="collection-item"
              onClick={() => onRemoveFromCollection(game.id)}
            >
              {game.thumbnail && (
                <img 
                  src={game.thumbnail} 
                  alt={game.name}
                  className="collection-thumbnail"
                />
              )}
              <div className="collection-item-info">
                <h4 className="collection-item-title">{game.name}</h4>
                <button className="remove-button">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}