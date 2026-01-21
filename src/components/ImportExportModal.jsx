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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#1f2937' }}>Import Collection</h3>
          <button
            onClick={closeModal}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: 0
            }}
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
          style={{ marginBottom: '1rem' }}
        />
        
        {error && (
          <div className="import-error" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleImport} 
            disabled={!importDataToUse.trim()}
            className="import-button"
            style={{ flex: 1, marginBottom: 0 }}
          >
            Import Collection
          </button>
          <button
            onClick={closeModal}
            style={{
              flex: 1,
              padding: '1rem',
              background: '#e5e7eb',
              color: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
});