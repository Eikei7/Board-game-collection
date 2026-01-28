import { memo, useRef, useState } from 'react';
import { Trash2, Download, Upload, ArrowUpAZ, ArrowDownAZ, LayoutGrid, List } from 'lucide-react';

export const DigitalShelf = memo(({ collection, onRemoveFromCollection, onExport, onSortChange, currentSort }) => {
  const [viewMode, setViewMode] = useState('grid');
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="digital-shelf">
      <div className="shelf-header">
        <div className="shelf-header-inner">
          <div>
            <h2 className="section-title">My Games ({collection.length})</h2>
          </div>
          
          <div className="shelf-actions">
            
            {collection.length > 0 && (
              <div className="view-container" style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '12px', padding: '2px', marginRight: '0.5rem' }}>
                <button 
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  style={getSortButtonStyle(viewMode === 'grid')}
                >
                  <LayoutGrid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  title="List View"
                  style={getSortButtonStyle(viewMode === 'list')}
                >
                  <List size={18} />
                </button>
              </div>
            )}

            {collection.length > 0 && (
              <div className="sort-container" style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '12px', padding: '2px' }}>
                <button 
                  onClick={() => onSortChange('name-asc')}
                  className={`sort-toggle ${currentSort === 'name-asc' ? 'active' : ''}`}
                  title="Sort A-Z"
                  style={getSortButtonStyle(currentSort === 'name-asc')}
                >
                  <ArrowDownAZ size={18} />
                </button>
                <button 
                  onClick={() => onSortChange('name-desc')}
                  className={`sort-toggle ${currentSort === 'name-desc' ? 'active' : ''}`}
                  title="Sort Z-A"
                  style={getSortButtonStyle(currentSort === 'name-desc')}
                >
                  <ArrowUpAZ size={18} />
                </button>
              </div>
            )}

            <button onClick={onExport} className="export-button">
            <Download size={16} />
            <span className="button-text">Export</span>
          </button>

          <button 
            onClick={handleImportClick}
            className="export-button" 
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
          >
            <Upload size={16} />
            <span className="button-text">Import</span>
          </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const content = event.target?.result;
                    const parsed = JSON.parse(content);
                    if (Array.isArray(parsed)) {
                      const isValid = parsed.every(item => 
                        item.id && item.name && typeof item.id === 'string'
                      );
                      if (isValid) {
                        window.dispatchEvent(new CustomEvent('importGames', { detail: { games: parsed } }));
                      }
                    }
                  } catch (err) {
                    alert('Invalid JSON file');
                  }
                };
                reader.readAsText(file);
              }}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
      
      {collection.length === 0 ? (
        <div className="empty-shelf">
          <p>Your shelf is empty!</p>
          <p>Search for games above to start building your collection.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'collection-grid' : 'collection-list'}>
          {collection.map((game) => (
            <div key={game.id} className="collection-item">
              {game.image && (
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="collection-thumbnail"
                />
              )}
              <div className="collection-item-info">
                <div className="collection-text-wrapper">
                  <h4 className="collection-item-title">{game.name}</h4>
                  <span className="year-text">
                  {game.yearpublished} | {game.minplayers}-{game.maxplayers} players | {game.minplaytime}-{game.maxplaytime} mins 
                  {game.addedAt && ` | Added ${game.addedAt}`}
                </span>
                </div>
                
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
  );
});

const getSortButtonStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.5rem',
  border: 'none',
  borderRadius: '10px',
  background: isActive ? 'white' : 'transparent',
  color: isActive ? '#0d9488' : '#6b7280',
  cursor: 'pointer',
  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
  transition: 'all 0.2s ease'
});