import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Trash2, Download, Upload, ArrowUpAZ, ArrowDownAZ, LayoutGrid, List, ArrowUp01, ArrowDown01, ChevronLeft, ChevronRight } from 'lucide-react';

const GAMES_PER_PAGE = 12;

export const DigitalShelf = memo(({ collection, onRemoveFromCollection, onExport, onSortChange, currentSort }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);
  const pageCount = Math.ceil(collection.length / GAMES_PER_PAGE);

  const displayedPage = pageCount > 0 ? Math.min(currentPage, pageCount) : 1;
  const paginatedCollection = useMemo(() => {
    const startIndex = (displayedPage - 1) * GAMES_PER_PAGE;
    return collection.slice(startIndex, startIndex + GAMES_PER_PAGE);
  }, [collection, displayedPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentSort]);

  useEffect(() => {
    if (pageCount === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (currentPage > pageCount && pageCount > 0) {
      setCurrentPage(pageCount);
    }
  }, [currentPage, pageCount]);

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
              <div className="view-container" style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '12px', padding: '2px' }}>
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
                  title="Sort A-Z"
                  style={getSortButtonStyle(currentSort === 'name-asc')}
                >
                  <ArrowDownAZ size={18} />
                </button>
                <button 
                  onClick={() => onSortChange('name-desc')}
                  title="Sort Z-A"
                  style={getSortButtonStyle(currentSort === 'name-desc')}
                >
                  <ArrowUpAZ size={18} />
                </button>
                <button 
                  onClick={() => onSortChange('playtime-asc')}
                  title="Sort by playtime (short to long)"
                  style={getSortButtonStyle(currentSort === 'playtime-asc')}
                >
                  <ArrowUp01 size={18} />
                </button>
                <button 
                  onClick={() => onSortChange('playtime-desc')}
                  title="Sort by playtime (long to short)"
                  style={getSortButtonStyle(currentSort === 'playtime-desc')}
                >
                  <ArrowDown01 size={18} />
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
                  } catch {
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
          {paginatedCollection.map((game) => (
            <div 
              key={game.id} 
              className={viewMode === 'grid' ? 'collection-item-grid' : 'collection-item'}
              style={viewMode === 'grid' && game.image ? { 
                backgroundImage: `url("${game.image}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {}}
            >
              {/* Overlay for readability in grid view */}
              {viewMode === 'grid' && <div className="collection-item-overlay" />}
              
              {/* Thumbnail only shows in list view */}
              {viewMode === 'list' && (game.image || game.thumbnail) && (
                <img 
                  src={game.image || game.thumbnail}
                  alt={game.name}
                  className="collection-thumbnail"
                />
              )}

              <div className={viewMode === 'grid' ? 'collection-item-info-grid' : 'collection-item-info'}>
                {viewMode === 'list' && (
                  <div className="collection-text-wrapper">
                    <h4 className="collection-item-title">{game.name}</h4>
                    <span className="year-text">
                      {game.yearpublished} | {game.minplayers}-{game.maxplayers} players | {game.minplaytime}-{game.maxplaytime} mins 
                      {game.addedAt && ` | Added ${game.addedAt}`}
                    </span>
                  </div>
                )}
                
                {viewMode === 'grid' && (
                  <div className="collection-grid-content">
                    <h4 className="collection-item-title-grid">{game.name}</h4>
                    <span className="collection-grid-meta">
                      {game.yearpublished} | {game.minplayers}-{game.maxplayers} players | {game.minplaytime}-{game.maxplaytime} min
                    </span>
                  </div>
                )}
                
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

      {pageCount > 1 && (
        <div className="pagination" aria-label="Collection pagination">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={displayedPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
            <span>Previous</span>
          </button>
          <span className="pagination-info" aria-live="polite">
            Page {displayedPage} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            disabled={displayedPage === pageCount}
            className="pagination-button"
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
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
  transition: 'all 0.2s ease',
  flex: 1
});