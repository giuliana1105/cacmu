import { useState, useMemo } from 'react';

// Map raw column names to friendly Spanish labels
const FIELD_LABELS = {
  NUMERO_CREDITO: 'Número de Crédito',
  CODIGO_SUCURSAL: 'Código Sucursal',
  NOMBRE_SUCURSAL: 'Nombre Sucursal',
  ORIGEN_RECURSOS: 'Origen de Recursos',
  CODIGO_SOCIO: 'Código Socio',
  CEDULA: 'Cédula',
  GRUPO_ORG: 'Grupo Organizacional',
  CALIFICACION_C02: 'Calificación C02',
  PROVINCIA: 'Provincia',
  CANTON: 'Cantón',
  PARROQUIA: 'Parroquia',
  COMUNIDAD: 'Comunidad',
  FECHA_CONCESION: 'Fecha de Concesión',
  NOMBRES: 'Nombres',
  DIRECCION_SOCIO: 'Dirección del Socio',
  SECTOR: 'Sector',
  BARRIO: 'Barrio',
  TELEFONO: 'Teléfono',
  CELULAR: 'Celular',
  DIREC_GEOREFERENCIAL: 'Dirección Georeferencial',
  PROFESION: 'Profesión',
  CED_CONYUGE: 'Cédula Cónyuge',
  NOMBRES_CONYUGE: 'Nombres Cónyuge',
  NOM_GRUPO: 'Nombre Grupo',
  TELEF_CONYUGE: 'Teléfono Cónyuge',
  NOMBRE_TRABAJO: 'Nombre del Trabajo',
  CARGO_TRABAJO: 'Cargo del Trabajo',
  DIRECCION_TRABAJO: 'Dirección del Trabajo',
  TELEFONO_TRABAJO: 'Teléfono del Trabajo',
  NOMBRE_FAMILIAR: 'Nombre Familiar',
  PARENTESCO: 'Parentesco',
  DIRECCION_FAMILIAR: 'Dirección Familiar',
  TELEFONO_FAMILIAR: 'Teléfono Familiar',
  COD_LIQUID: 'Código Liquidador',
  LIQUIDADOR: 'Liquidador',
  COD_OFCREDITO: 'Código Of. Crédito',
  OFICIAL_CREDITO: 'Oficial de Crédito',
  CARTERA_GESTION_COBRANZA: 'Cartera Gestión Cobranza',
  GARANTE_1: 'Garante 1',
  CED_GAR_1: 'Cédula Garante 1',
  DIRECCION_GARA_1: 'Dirección Garante 1',
  TELEFONO_GARA_1: 'Teléfono Garante 1',
  GARANTE_2: 'Garante 2',
  CED_GAR_2: 'Cédula Garante 2',
  DIRECCION_GARA_2: 'Dirección Garante 2',
  TELEFONO_GARA_2: 'Teléfono Garante 2',
  CUENTA_AH_VISTA: 'Cuenta Ahorro Vista',
  SALDO_DISPONIBLE: 'Saldo Disponible',
  SALDO_BLOQUEADO: 'Saldo Bloqueado',
  CERTIFICADOS: 'Certificados',
  SALDO_META: 'Saldo Meta',
  SALDO_ENCAJE: 'Saldo Encaje',
  SALDO_CESANTIA: 'Saldo Cesantía',
  SALDO_FUTURO: 'Saldo Futuro',
  MONTO_PRESTADO: 'Monto Prestado',
  SALDO_CAPITAL_PEND: 'Saldo Capital Pendiente',
  VALOR_CANCELA: 'Valor a Cancelar',
  VALOR_NOTIFICACIONES: 'Valor Notificaciones',
  VALOR_JUDICIAL: 'Valor Judicial',
  CAPITAL_VENCIDO: 'Capital Vencido',
  DIAS_VENCIDO: 'Días Vencido',
  FECHA_VENCE: 'Fecha Vence',
  TOTAL_VENCIDO: 'Total Vencido',
  POR_VENCER_MANANA: 'Por Vencer Mañana',
  MCLI_OBSERVAC: 'Observaciones',
  ESTADO_JUDI: 'Estado Judicial',
  NOTIFICACION: 'Notificación',
  CARTERA_CASTIGADA: 'Cartera Castigada',
  CART_CASTG_ARCHIVO: 'Cartera Castigada Archivo',
  PERIODICIDAD: 'Periodicidad',
  PRIMERA_CUOTA: 'Primera Cuota',
  CALIFICACION: 'Calificación',
  MISION_ESCALABRINIANA: 'Misión Escalabriniana',
  CUENTAS_X_COBRAR: 'Cuentas por Cobrar',
  COBRO_NOTIFICACION: 'Cobro Notificación',
  GARANTIA_REAL: 'Garantía Real',
  REPROGRAMADO: 'Reprogramado',
  ASIGNADO: 'Asignado',
  CASTIGADO: 'Castigado',
  JUICIO: 'Juicio',
  PRIMERA_CUOTA_ATRASADA: 'Primera Cuota Atrasada',
  GESTION_COBRANZA: 'Gestión Cobranza',
  APLAZADO: 'Aplazado',
  CUOTAS_VENCIDAS: 'Cuotas Vencidas',
  FECHA_ULTIMO_PAGO: 'Fecha Último Pago',
  FECHA_PRIMERA_ASIGNACION: 'Fecha Primera Asignación',
  FECHA_ULTIMA_GESTION: 'Fecha Última Gestión',
};

function getFieldLabel(column) {
  return FIELD_LABELS[column] || column.replace(/_/g, ' ');
}

// Categorize fields for a better organized UI
function categorizeFields(columns) {
  const categories = {
    'Información del Cliente': ['NUMERO_CREDITO', 'CODIGO_SOCIO', 'CEDULA', 'NOMBRES', 'PROFESION', 'TELEFONO', 'CELULAR'],
    'Ubicación': ['PROVINCIA', 'CANTON', 'PARROQUIA', 'COMUNIDAD', 'DIRECCION_SOCIO', 'SECTOR', 'BARRIO', 'DIREC_GEOREFERENCIAL'],
    'Crédito': ['MONTO_PRESTADO', 'SALDO_CAPITAL_PEND', 'VALOR_CANCELA', 'CAPITAL_VENCIDO', 'TOTAL_VENCIDO', 'DIAS_VENCIDO', 'FECHA_CONCESION', 'FECHA_VENCE', 'PERIODICIDAD', 'PRIMERA_CUOTA', 'CALIFICACION', 'CALIFICACION_C02', 'NOM_GRUPO'],
    'Sucursal y Gestión': ['CODIGO_SUCURSAL', 'NOMBRE_SUCURSAL', 'ORIGEN_RECURSOS', 'GRUPO_ORG', 'COD_LIQUID', 'LIQUIDADOR', 'COD_OFCREDITO', 'OFICIAL_CREDITO', 'CARTERA_GESTION_COBRANZA', 'ASIGNADO', 'GESTION_COBRANZA'],
    'Garantes': ['GARANTE_1', 'CED_GAR_1', 'DIRECCION_GARA_1', 'TELEFONO_GARA_1', 'GARANTE_2', 'CED_GAR_2', 'DIRECCION_GARA_2', 'TELEFONO_GARA_2'],
    'Cónyuge / Familiar': ['CED_CONYUGE', 'NOMBRES_CONYUGE', 'TELEF_CONYUGE', 'NOMBRE_FAMILIAR', 'PARENTESCO', 'DIRECCION_FAMILIAR', 'TELEFONO_FAMILIAR'],
    'Trabajo': ['NOMBRE_TRABAJO', 'CARGO_TRABAJO', 'DIRECCION_TRABAJO', 'TELEFONO_TRABAJO'],
    'Saldos y Cuentas': ['CUENTA_AH_VISTA', 'SALDO_DISPONIBLE', 'SALDO_BLOQUEADO', 'CERTIFICADOS', 'SALDO_META', 'SALDO_ENCAJE', 'SALDO_CESANTIA', 'SALDO_FUTURO', 'CUENTAS_X_COBRAR', 'COBRO_NOTIFICACION'],
    'Mora y Cobranza': ['POR_VENCER_MANANA', 'VALOR_NOTIFICACIONES', 'VALOR_JUDICIAL', 'ESTADO_JUDI', 'NOTIFICACION', 'CARTERA_CASTIGADA', 'CART_CASTG_ARCHIVO', 'GARANTIA_REAL', 'REPROGRAMADO', 'CASTIGADO', 'JUICIO', 'PRIMERA_CUOTA_ATRASADA', 'APLAZADO', 'CUOTAS_VENCIDAS', 'FECHA_ULTIMO_PAGO', 'FECHA_PRIMERA_ASIGNACION', 'FECHA_ULTIMA_GESTION', 'MISION_ESCALABRINIANA'],
    'Otros': ['MCLI_OBSERVAC'],
  };

  const categorized = [];
  const used = new Set();

  for (const [category, fields] of Object.entries(categories)) {
    const matchedFields = fields.filter(f => columns.includes(f));
    if (matchedFields.length > 0) {
      categorized.push({ category, fields: matchedFields });
      matchedFields.forEach(f => used.add(f));
    }
  }

  // Any remaining fields that weren't categorized
  const remaining = columns.filter(c => !used.has(c));
  if (remaining.length > 0) {
    categorized.push({ category: 'Otros Campos', fields: remaining });
  }

  return categorized;
}

function FieldSelector({ columns, onAccept, onBack }) {
  const [selected, setSelected] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const categorizedFields = useMemo(() => categorizeFields(columns), [columns]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categorizedFields;

    const term = searchTerm.toLowerCase();
    return categorizedFields
      .map(cat => ({
        ...cat,
        fields: cat.fields.filter(f =>
          f.toLowerCase().includes(term) ||
          getFieldLabel(f).toLowerCase().includes(term)
        )
      }))
      .filter(cat => cat.fields.length > 0);
  }, [categorizedFields, searchTerm]);

  const toggleField = (field) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const selectAll = () => {
    const allVisible = filteredCategories.flatMap(c => c.fields);
    setSelected(new Set(allVisible));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleAccept = () => {
    if (selected.size > 0) {
      // Preserve original column order
      const orderedSelection = columns.filter(c => selected.has(c));
      onAccept(orderedSelection);
    }
  };

  const removeTag = (field) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  return (
    <div className="field-selector" id="field-selector">
      <div className="field-selector-header">
        <h2>Selecciona los Campos</h2>
        <p>
          Elige los campos que deseas visualizar de tus <strong>{columns.length}</strong> columnas disponibles.
          Solo los campos seleccionados aparecerán en la tabla de resultados.
        </p>
      </div>

      <div className="field-selector-toolbar">
        <div className="field-search">
          <span className="field-search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar campo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="field-search-input"
          />
        </div>

        <div className="field-counter">
          <span className="count">{selected.size}</span>
          <span>de {columns.length} seleccionados</span>
        </div>

        <div className="field-quick-actions">
          <button className="quick-action-btn" onClick={selectAll} id="btn-select-all">
            Seleccionar todo
          </button>
          <button className="quick-action-btn" onClick={deselectAll} id="btn-deselect-all">
            Deseleccionar todo
          </button>
        </div>
      </div>

      <div className="field-grid" id="field-grid">
        {filteredCategories.map(({ category, fields }) => (
          <div key={category} style={{ gridColumn: '1 / -1' }}>
            <div style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 'var(--space-2)',
              marginTop: 'var(--space-3)',
              padding: '0 var(--space-1)',
            }}>
              {category}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 'var(--space-3)',
            }}>
              {fields.map((field) => (
                <div
                  key={field}
                  className={`field-chip ${selected.has(field) ? 'selected' : ''}`}
                  onClick={() => toggleField(field)}
                  role="checkbox"
                  aria-checked={selected.has(field)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleField(field); } }}
                  id={`field-${field}`}
                >
                  <div className="field-checkbox">
                    {selected.has(field) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="field-name" title={field}>
                    {getFieldLabel(field)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="no-results" style={{ gridColumn: '1 / -1' }}>
            <div className="no-results-icon">🔍</div>
            <h3>Sin resultados</h3>
            <p>No se encontraron campos que coincidan con "{searchTerm}"</p>
          </div>
        )}
      </div>

      <div className="field-selector-footer" id="field-selector-footer">
        <div className="selected-tags">
          {selected.size === 0 ? (
            <span className="empty-tags">Selecciona al menos un campo para continuar</span>
          ) : (
            Array.from(selected).slice(0, 10).map(field => (
              <span key={field} className="selected-tag">
                {getFieldLabel(field)}
                <button onClick={(e) => { e.stopPropagation(); removeTag(field); }} title="Quitar campo">
                  ×
                </button>
              </span>
            ))
          )}
          {selected.size > 10 && (
            <span className="selected-tag">+{selected.size - 10} más</span>
          )}
        </div>

        <div className="field-selector-actions">
          <button className="btn btn-secondary" onClick={onBack} id="btn-back-fields">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleAccept}
            disabled={selected.size === 0}
            id="btn-accept-fields"
          >
            Aceptar ({selected.size} {selected.size === 1 ? 'campo' : 'campos'})
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FieldSelector;
