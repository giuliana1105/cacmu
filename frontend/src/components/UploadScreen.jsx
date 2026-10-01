import { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';

function UploadScreen({ onFileLoaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      setError('Formato no válido. Por favor sube un archivo Excel (.xlsx, .xls) o CSV.');
      setTimeout(() => setError(null), 4000);
      return;
    }

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        if (jsonData.length === 0) {
          setError('El archivo está vacío o no contiene datos válidos.');
          setIsLoading(false);
          setTimeout(() => setError(null), 4000);
          return;
        }

        const columns = Object.keys(jsonData[0]);
        onFileLoaded(jsonData, columns, file.name);
      } catch (err) {
        console.error('Error processing file:', err);
        setError('Error al procesar el archivo. Verifica que sea un Excel válido.');
        setTimeout(() => setError(null), 4000);
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setIsLoading(false);
      setTimeout(() => setError(null), 4000);
    };

    reader.readAsArrayBuffer(file);
  }, [onFileLoaded]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="upload-screen" id="upload-screen">
        <div className="upload-hero">
          <h1>Gestión Inteligente de Créditos y Mora</h1>
          <p>
            Carga tu archivo Excel con los datos de clientes y créditos.
            Selecciona solo los campos que necesitas para generar tu reporte personalizado.
          </p>
        </div>

        <div
          className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
          id="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
          aria-label="Zona de carga de archivos"
        >
          <div className="dropzone-content">
            <div className="dropzone-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="dropzone-text">
              <h3>Arrastra y suelta tu archivo aquí</h3>
              <p>
                o <span className="browse-link">explora tus archivos</span>
              </p>
              <p style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.6 }}>
                Formatos aceptados: .xlsx, .xls, .csv
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            id="file-input"
          />
        </div>

        <div className="upload-features">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h4>Selección de Campos</h4>
            <p>Elige exactamente los campos que necesitas para tu análisis</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h4>Búsqueda Rápida</h4>
            <p>Filtra y busca entre todos tus clientes en tiempo real</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Vista Personalizada</h4>
            <p>Visualiza los datos exactos que importan para tu gestión</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay" id="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner" />
            <p className="loading-text">Procesando archivo...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-toast" id="error-toast" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </div>
      )}
    </>
  );
}

export default UploadScreen;
