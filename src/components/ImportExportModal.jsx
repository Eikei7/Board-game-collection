import { useState, useCallback, memo } from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ImportExportModal = memo(({ isOpen, data, onClose, onImport }) => {
  const [importData, setImportData] = useState('');
  const [error, setError] = useState('');

  const importDataToUse = data || importData;

  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importDataToUse);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Data should be an array of games');
      }

      if (parsed.length === 0) {
        throw new Error('Collection is empty');
      }

      const isValid = parsed.every(item => 
        item.id && item.name && typeof item.id === 'string'
      );

      if (!isValid) {
        throw new Error('Invalid game data format. Each game needs an "id" and "name"');
      }

      onImport(parsed);
    } catch (err) {
      setError(err.message);
    }
  }, [importDataToUse, onImport]);

  const closeModal = () => {
    setImportData('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Import Collection</h3>
          <button
            onClick={closeModal}
            className="modal-close-button"
          >
            <X size={24} />
          </button>
        </div>

        <textarea
          value={importDataToUse}
          onChange={(e) => setImportData(e.target.value)}
          placeholder='Paste your JSON data here or upload a file...'
          className="import-textarea"
          rows="10"
        />
        
        {error && (
          <div className="import-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <div className="modal-actions">
          <button 
            onClick={handleImport} 
            disabled={!importDataToUse.trim()}
            className="import-button"
          >
            Import Collection
          </button>
          <button
            onClick={closeModal}
            className="modal-cancel-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});