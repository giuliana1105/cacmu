import { useState } from 'react';
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

function SelectedResults({ data, selectedFields, fileName, onBack, onReset }) {
  const handleExportExcel = () => {
    const exportData = data.map(row => {
      const filtered = {};
      selectedFields.forEach(field => {
        filtered[getColumnLabel(field)] = row[field] ?? '';
      });
      return filtered;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte Final');

    const wbOut = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbOut], { type: 'application/octet-stream' });
    saveAs(blob, `CACMU_Reporte_Final_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="data-table-screen" id="selected-results-screen">
      <div className="data-table-header">
        <div className="data-table-title-section">
          <h2>Reporte Final</h2>
          <div className="data-table-stats">
            <div className="stat-badge">
              <span className="stat-value">{data.length}</span>
              <span className="stat-label">registros seleccionados</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value">{selectedFields.length}</span>
              <span className="stat-label">campos</span>
            </div>
          </div>
        </div>

        <div className="data-table-actions">
          <button className="btn btn-secondary" onClick={onBack} id="btn-back-to-filters">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver
          </button>

          <button className="btn btn-primary" onClick={handleExportExcel} id="btn-export-final">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar Excel
          </button>
        </div>
      </div>

      <div className="table-container">
        {data.length > 0 ? (
          <div className="table-scroll">
            <table className="data-table" id="final-results-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                  {selectedFields.map(field => (
                    <th key={field}>
                      <span className="th-label">
                        {getColumnLabel(field)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr key={index}>
                    <td className="row-number">
                      {index + 1}
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
        ) : (
          <div className="no-results">
            <div className="no-results-icon">⚠️</div>
            <h3>No se seleccionaron registros</h3>
            <p>Vuelve al paso anterior y selecciona al menos un registro.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectedResults;
