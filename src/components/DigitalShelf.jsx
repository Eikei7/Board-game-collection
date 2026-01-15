import { memo } from 'react';
import { Trash2 } from 'lucide-react';

export const DigitalShelf = memo(({ collection, onRemoveFromCollection }) => (
  <div className="digital-shelf">
    <div className="shelf-header">
      <h2 className="section-title">Your Collection ({collection.length})</h2>
      {collection.length > 0 && (
        <p className="shelf-subtitle">Click trash icon to remove</p>
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
          <div key={game.id} className="collection-item">
            {game.thumbnail && (
              <img 
                src={game.thumbnail} 
                alt={game.name}
                className="collection-thumbnail"
              />
            )}
            <div className="collection-item-info">
              <h4 className="collection-item-title">{game.name}</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromCollection(game.id);
                }}
                className="remove-button"
                aria-label={`Remove ${game.name}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
));