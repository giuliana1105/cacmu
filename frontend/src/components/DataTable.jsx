import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const FIELD_LABELS = {
  NUMERO_CREDITO: 'N° Crédito',
  CODIGO_SUCURSAL: 'Cód. Sucursal',
  NOMBRE_SUCURSAL: 'Sucursal',
  ORIGEN_RECURSOS: 'Origen Recursos',
  CODIGO_SOCIO: 'Cód. Socio',
  CEDULA: 'Cédula',
  GRUPO_ORG: 'Grupo Org.',
  CALIFICACION_C02: 'Calif. C02',
  PROVINCIA: 'Provincia',
  CANTON: 'Cantón',
  PARROQUIA: 'Parroquia',
  COMUNIDAD: 'Comunidad',
  FECHA_CONCESION: 'Fecha Concesión',
  NOMBRES: 'Nombres',
  DIRECCION_SOCIO: 'Dirección',
  SECTOR: 'Sector',
  BARRIO: 'Barrio',
  TELEFONO: 'Teléfono',
  CELULAR: 'Celular',
  DIREC_GEOREFERENCIAL: 'Georeferencia',
  PROFESION: 'Profesión',
  CED_CONYUGE: 'Céd. Cónyuge',
  NOMBRES_CONYUGE: 'Cónyuge',
  NOM_GRUPO: 'Grupo',
  TELEF_CONYUGE: 'Tel. Cónyuge',
  NOMBRE_TRABAJO: 'Trabajo',
  CARGO_TRABAJO: 'Cargo',
  DIRECCION_TRABAJO: 'Dir. Trabajo',
  TELEFONO_TRABAJO: 'Tel. Trabajo',
  NOMBRE_FAMILIAR: 'Familiar',
  PARENTESCO: 'Parentesco',
  DIRECCION_FAMILIAR: 'Dir. Familiar',
  TELEFONO_FAMILIAR: 'Tel. Familiar',
  COD_LIQUID: 'Cód. Liquidador',
  LIQUIDADOR: 'Liquidador',
  COD_OFCREDITO: 'Cód. Of. Crédito',
  OFICIAL_CREDITO: 'Of. Crédito',
  CARTERA_GESTION_COBRANZA: 'Cartera Gestión',
  GARANTE_1: 'Garante 1',
  CED_GAR_1: 'Céd. Garante 1',
  DIRECCION_GARA_1: 'Dir. Garante 1',
  TELEFONO_GARA_1: 'Tel. Garante 1',
  GARANTE_2: 'Garante 2',
  CED_GAR_2: 'Céd. Garante 2',
  DIRECCION_GARA_2: 'Dir. Garante 2',
  TELEFONO_GARA_2: 'Tel. Garante 2',
  CUENTA_AH_VISTA: 'Cta. Ahorro',
  SALDO_DISPONIBLE: 'Saldo Disponible',
  SALDO_BLOQUEADO: 'Saldo Bloqueado',
  CERTIFICADOS: 'Certificados',
  SALDO_META: 'Saldo Meta',
  SALDO_ENCAJE: 'Saldo Encaje',
  SALDO_CESANTIA: 'Saldo Cesantía',
  SALDO_FUTURO: 'Saldo Futuro',
  MONTO_PRESTADO: 'Monto Prestado',
  SALDO_CAPITAL_PEND: 'Saldo Capital Pend.',
  VALOR_CANCELA: 'Valor Cancela',
  VALOR_NOTIFICACIONES: 'Valor Notif.',
  VALOR_JUDICIAL: 'Valor Judicial',
  CAPITAL_VENCIDO: 'Capital Vencido',
  DIAS_VENCIDO: 'Días Vencido',
  FECHA_VENCE: 'Fecha Vence',
  TOTAL_VENCIDO: 'Total Vencido',
  POR_VENCER_MANANA: 'Por Vencer',
  MCLI_OBSERVAC: 'Observaciones',
  ESTADO_JUDI: 'Estado Judicial',
  NOTIFICACION: 'Notificación',
  CARTERA_CASTIGADA: 'Cart. Castigada',
  CART_CASTG_ARCHIVO: 'Cast. Archivo',
  PERIODICIDAD: 'Periodicidad',
  PRIMERA_CUOTA: 'Primera Cuota',
  CALIFICACION: 'Calificación',
  MISION_ESCALABRINIANA: 'Misión Escal.',
  CUENTAS_X_COBRAR: 'Ctas. por Cobrar',
  COBRO_NOTIFICACION: 'Cobro Notif.',
  GARANTIA_REAL: 'Garantía Real',
  REPROGRAMADO: 'Reprogramado',
  ASIGNADO: 'Asignado',
  CASTIGADO: 'Castigado',
  JUICIO: 'Juicio',
  PRIMERA_CUOTA_ATRASADA: 'Cuota Atrasada',
  GESTION_COBRANZA: 'Gestión Cobranza',
  APLAZADO: 'Aplazado',
  CUOTAS_VENCIDAS: 'Cuotas Vencidas',
  FECHA_ULTIMO_PAGO: 'Último Pago',
  FECHA_PRIMERA_ASIGNACION: 'Primera Asign.',
  FECHA_ULTIMA_GESTION: 'Última Gestión',
};

function getColumnLabel(col) {
  return FIELD_LABELS[col] || col.replace(/_/g, ' ');
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

/**
 * Determines if a column is filterable based on its unique values.
 * A column is filterable if:
 * - It has <= MAX_UNIQUE unique non-empty values
 * - The ratio of unique values to total rows is < 0.4 (i.e., values repeat)
 */
const MAX_UNIQUE_FOR_FILTER = 50;
const UNIQUENESS_RATIO_THRESHOLD = 0.4;

function getFilterableColumns(data, selectedFields) {
  const filterableMap = {};

  for (const field of selectedFields) {
    const valueSet = new Set();
    let nonEmptyCount = 0;

    for (const row of data) {
      const val = row[field];
      if (val !== null && val !== undefined && val !== '' && String(val).trim() !== '' && String(val).trim() !== ',') {
        valueSet.add(String(val).trim());
        nonEmptyCount++;
      }
    }

    const uniqueCount = valueSet.size;
    const ratio = nonEmptyCount > 0 ? uniqueCount / nonEmptyCount : 1;

    if (uniqueCount >= 2 && uniqueCount <= MAX_UNIQUE_FOR_FILTER && ratio < UNIQUENESS_RATIO_THRESHOLD) {
      // Sort values alphabetically for the dropdown
      const sortedValues = Array.from(valueSet).sort((a, b) =>
        a.localeCompare(b, 'es', { sensitivity: 'base' })
      );
      filterableMap[field] = sortedValues;
    }
  }

  return filterableMap;
}

/* ===== Column Filter Dropdown Component ===== */
function ColumnFilterDropdown({ field, uniqueValues, activeFilters, onFilterChange, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelected, setLocalSelected] = useState(
    new Set(activeFilters[field] || [])
  );
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Focus search input on open
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredValues = useMemo(() => {
    if (!searchTerm.trim()) return uniqueValues;
    const term = searchTerm.toLowerCase();
    return uniqueValues.filter(v => v.toLowerCase().includes(term));
  }, [uniqueValues, searchTerm]);

  const toggleValue = (val) => {
    setLocalSelected(prev => {
      const next = new Set(prev);
      if (next.has(val)) {
        next.delete(val);
      } else {
        next.add(val);
      }
      return next;
    });
  };

  const selectAll = () => {
    setLocalSelected(new Set(filteredValues));
  };

  const deselectAll = () => {
    setLocalSelected(new Set());
  };

  const applyFilter = () => {
    onFilterChange(field, Array.from(localSelected));
    onClose();
  };

  const clearFilter = () => {
    onFilterChange(field, []);
    onClose();
  };

  const isActive = localSelected.size > 0 && localSelected.size < uniqueValues.length;

  return (
    <div className="column-filter-dropdown" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
      <div className="filter-dropdown-header">
        <span className="filter-dropdown-title">Filtrar: {getColumnLabel(field)}</span>
      </div>

      <div className="filter-dropdown-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar valor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filter-dropdown-actions-top">
        <button onClick={selectAll} className="filter-mini-btn">Todos</button>
        <button onClick={deselectAll} className="filter-mini-btn">Ninguno</button>
        <span className="filter-count-label">{localSelected.size} de {uniqueValues.length}</span>
      </div>

      <div className="filter-dropdown-list">
        {filteredValues.map(val => (
          <label key={val} className={`filter-option ${localSelected.has(val) ? 'selected' : ''}`} onClick={() => toggleValue(val)}>
            <div className={`filter-option-checkbox ${localSelected.has(val) ? 'checked' : ''}`}>
              {localSelected.has(val) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span className="filter-option-text" title={val}>{val}</span>
          </label>
        ))}
        {filteredValues.length === 0 && (
          <div className="filter-no-results">Sin resultados</div>
        )}
      </div>

      <div className="filter-dropdown-footer">
        <button className="filter-btn-clear" onClick={clearFilter}>
          Limpiar
        </button>
        <button className="filter-btn-apply" onClick={applyFilter}>
          Aplicar filtro
        </button>
      </div>
    </div>
  );
}

const ROWS_PER_PAGE = 25;

function DataTable({ data, selectedFields, fileName, onBack, onReset }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnFilters, setColumnFilters] = useState({}); // { field: [selectedValues] }
  const [openFilter, setOpenFilter] = useState(null); // which field's filter dropdown is open

  // Compute which columns are filterable
  const filterableColumns = useMemo(() => getFilterableColumns(data, selectedFields), [data, selectedFields]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleFilterChange = useCallback((field, selectedValues) => {
    setColumnFilters(prev => {
      const next = { ...prev };
      if (selectedValues.length === 0) {
        delete next[field];
      } else {
        next[field] = selectedValues;
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const toggleFilterDropdown = (field, e) => {
    e.stopPropagation();
    setOpenFilter(prev => prev === field ? null : field);
  };

  const closeFilter = useCallback(() => {
    setOpenFilter(null);
  }, []);

  // Count active filters
  const activeFilterCount = Object.keys(columnFilters).length;

  const clearAllFilters = () => {
    setColumnFilters({});
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = data;

    // Apply column filters (AND logic between columns)
    for (const [field, allowedValues] of Object.entries(columnFilters)) {
      if (allowedValues.length > 0) {
        const allowedSet = new Set(allowedValues);
        result = result.filter(row => {
          const val = row[field];
          const strVal = (val !== null && val !== undefined && val !== '') ? String(val).trim() : '';
          return allowedSet.has(strVal);
        });
      }
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        selectedFields.some(field => {
          const val = row[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        })
      );
    }

    // Sorting
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField] ?? '';
        const bVal = b[sortField] ?? '';

        const aNum = Number(aVal);
        const bNum = Number(bVal);
        if (!isNaN(aNum) && !isNaN(bNum) && aVal !== '' && bVal !== '') {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        const comparison = String(aVal).localeCompare(String(bVal), 'es', { sensitivity: 'base' });
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection, selectedFields, columnFilters]);

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(row => {
      const filtered = {};
      selectedFields.forEach(field => {
        filtered[getColumnLabel(field)] = row[field] ?? '';
      });
      return filtered;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos Filtrados');

    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/octet-stream' });
    saveAs(blob, `CACMU_Reporte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="data-table-screen" id="data-table-screen">
      <div className="data-table-header">
        <div className="data-table-title-section">
          <h2>Resultados</h2>
          <div className="data-table-stats">
            <div className="stat-badge">
              <span className="stat-value">{filteredData.length}</span>
              <span className="stat-label">registros</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">{selectedFields.length}</span>
              <span className="stat-label">campos</span>
            </div>
            {activeFilterCount > 0 && (
              <div className="stat-badge stat-badge-filter">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span className="stat-value">{activeFilterCount}</span>
                <span className="stat-label">{activeFilterCount === 1 ? 'filtro activo' : 'filtros activos'}</span>
                <button className="clear-filters-btn" onClick={clearAllFilters} title="Limpiar todos los filtros">
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="data-table-actions">
          <div className="data-table-search">
            <span className="data-table-search-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar en resultados..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              id="data-search-input"
            />
          </div>

          <button className="btn btn-secondary" onClick={onBack} id="btn-back-results">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Cambiar campos
          </button>

          <button className="btn btn-primary" onClick={handleExportExcel} id="btn-export">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="table-container">
        {paginatedData.length > 0 || activeFilterCount > 0 || searchTerm ? (
          <>
            <div className="table-scroll">
              <table className="data-table" id="results-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                    {selectedFields.map(field => {
                      const isFilterable = !!filterableColumns[field];
                      const hasActiveFilter = !!columnFilters[field];
                      return (
                        <th
                          key={field}
                          className={`${sortField === field ? 'sort-active' : ''} ${hasActiveFilter ? 'filter-active' : ''}`}
                          style={{ position: 'relative' }}
                        >
                          <div className="th-content">
                            <span
                              className="th-label"
                              onClick={() => handleSort(field)}
                              title={`Ordenar por ${getColumnLabel(field)}`}
                            >
                              {getColumnLabel(field)}
                              <span className="sort-icon">
                                {sortField === field
                                  ? (sortDirection === 'asc' ? '↑' : '↓')
                                  : '↕'}
                              </span>
                            </span>
                            {isFilterable && (
                              <button
                                className={`th-filter-btn ${hasActiveFilter ? 'active' : ''}`}
                                onClick={(e) => toggleFilterDropdown(field, e)}
                                title={`Filtrar por ${getColumnLabel(field)}`}
                                id={`filter-btn-${field}`}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill={hasActiveFilter ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                </svg>
                                {hasActiveFilter && (
                                  <span className="filter-active-dot" />
                                )}
                              </button>
                            )}
                          </div>
                          {openFilter === field && (
                            <ColumnFilterDropdown
                              field={field}
                              uniqueValues={filterableColumns[field]}
                              activeFilters={columnFilters}
                              onFilterChange={handleFilterChange}
                              onClose={closeFilter}
                            />
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index}>
                      <td className="row-number">
                        {(currentPage - 1) * ROWS_PER_PAGE + index + 1}
                      </td>
                      {selectedFields.map(field => (
                        <td key={field} title={String(row[field] ?? '')}>
                          {formatCellValue(row[field])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paginatedData.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No se encontraron registros</h3>
                <p>Los filtros aplicados no coinciden con ningún registro.</p>
                <button className="btn btn-secondary" onClick={clearAllFilters} style={{ marginTop: '16px' }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {paginatedData.length > 0 && (
              <div className="table-footer">
                <div className="table-footer-info">
                  Mostrando {(currentPage - 1) * ROWS_PER_PAGE + 1} - {Math.min(currentPage * ROWS_PER_PAGE, filteredData.length)} de {filteredData.length} registros
                </div>
                {totalPages > 1 && (
                  <div className="table-pagination">
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      id="btn-prev-page"
                      aria-label="Página anterior"
                    >
                      ‹
                    </button>
                    {getPageNumbers().map((page, i) =>
                      page === '...' ? (
                        <span key={`dots-${i}`} style={{ padding: '0 4px', color: 'var(--color-text-muted)' }}>…</span>
                      ) : (
                        <button
                          key={page}
                          className={`page-btn ${page === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(page)}
                          id={`page-${page}`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      className="page-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      id="btn-next-page"
                      aria-label="Página siguiente"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">📭</div>
            <h3>No se encontraron registros</h3>
            <p>Intenta con un término de búsqueda diferente</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
