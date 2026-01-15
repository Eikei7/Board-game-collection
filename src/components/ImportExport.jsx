import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';

export function ImportExport({ collection, onImport }) {
  const [importData, setImportData] = useState('');
  const [error, setError] = useState('');

  const handleExport = () => {
    const dataStr = JSON.stringify(collection, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `board-game-collection-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      
      if (!Array.isArray(parsed)) {
        throw new Error('Data should be an array of games');
      }

      // Basic validation
      const isValid = parsed.every(item => 
        item.id && item.name && typeof item.id === 'string'
      );

      if (!isValid) {
        throw new Error('Invalid game data format');
      }

      onImport(parsed);
      setImportData('');
      setError('');
      alert(`Successfully imported ${parsed.length} games!`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="import-export">
      <h2 className="section-title">Import / Export Collection</h2>
      
      <div className="export-section">
        <h3>Export Collection</h3>
        <button onClick={handleExport} className="export-button">
          <Download size={16} />
          Export as JSON ({collection.length} games)
        </button>
      </div>

      <div className="import-section">
        <h3>Import Collection</h3>
        <div className="import-options">
          <div className="file-upload">
            <label className="file-upload-label">
              <Upload size={16} />
              Upload JSON File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="file-input"
              />
            </label>
          </div>
          
          <div className="import-divider">or paste JSON:</div>
          
          <textarea
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
            placeholder='Paste your JSON data here...'
            className="import-textarea"
            rows="6"
          />
          
          {error && (
            <div className="import-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <button 
            onClick={handleImport} 
            disabled={!importData.trim()}
            className="import-button"
          >
            Import Collection
          </button>
        </div>
      </div>
    </div>
  );
}