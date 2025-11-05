// tableFilters.js
// Control de filtros para la tabla de historial
// Importa funciones/datos desde table.js
import { historialData, renderTableWithData, refreshTable } from './table.js';

let filtered = false; // indica si hay filtros activos
let lastFilteredData = []; // guarda datos filtrados (opcional)

// Setup: se llama desde table.js cuando la tabla está lista
export function setupTableFilters() {
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    const clearFilterBtn = document.getElementById('clearFilterBtn');
    const refreshTableBtn = document.getElementById('refreshTableBtn');

    if (applyFilterBtn) applyFilterBtn.addEventListener('click', onApplyFilterClick);
    if (clearFilterBtn) clearFilterBtn.addEventListener('click', onClearFilterClick);
    if (refreshTableBtn) refreshTableBtn.addEventListener('click', onRefreshTableClick);

    // Si quieres también permitir aplicar filtros con Enter cuando focus esté en algún input:
    const inputs = document.querySelectorAll('#fechaInicio, #fechaFin, #horaInicio, #horaFin');
    inputs.forEach(i => i.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onApplyFilterClick();
        }
    }));
}

// Handler para el botón aplicar filtro
function onApplyFilterClick() {
    applyFilters();
}

// Handler para el botón limpiar filtro
function onClearFilterClick() {
    clearFilters();
}

// Handler botón actualizar tabla (trae todo desde servidor)
async function onRefreshTableClick() {
    // Traer datos desde server
    await refreshTable();

    // Si había filtros aplicados, reaplicarlos (porque refreshTable actualizó historialData)
    if (filtered) {
        applyFilters();
    } else {
        // si no hay filtros, simplemente renderizamos todo
        renderTableWithData(historialData);
    }
}

// Aplica los filtros seleccionados y muestra la tabla filtrada
export function applyFilters() {
    // Leer controles
    const fechaInicio = (document.getElementById('fechaInicio') || { value: '' }).value || '';
    const fechaFin = (document.getElementById('fechaFin') || { value: '' }).value || '';
    const horaInicio = (document.getElementById('horaInicio') || { value: '' }).value || '';
    const horaFin = (document.getElementById('horaFin') || { value: '' }).value || '';
    const soloAlarmas = (document.getElementById('soloAlarmas') || { checked: false }).checked;

    // recoger alarmas seleccionadas
    const selectedAlarms = Array.from(document.querySelectorAll('.alarm-type-checkbox'))
        .filter(cb => cb.checked)
        .map(cb => (cb.value || '').trim())
        .filter(v => v.length > 0);

    // empezamos con todos los datos
    let filteredData = Array.isArray(historialData) ? historialData.slice() : [];

    // --- Filtrar por fecha ---
    if (fechaInicio) {
        filteredData = filteredData.filter(d => d.fecha && d.fecha >= fechaInicio);
    }
    if (fechaFin) {
        filteredData = filteredData.filter(d => d.fecha && d.fecha <= fechaFin);
    }

    // --- Filtrar por hora ---
    if (horaInicio) {
        filteredData = filteredData.filter(d => d.hora && d.hora >= horaInicio);
    }
    if (horaFin) {
        filteredData = filteredData.filter(d => d.hora && d.hora <= horaFin);
    }

    // --- Filtrar solo alarmas (si se marca el checkbox soloAlarmas) ---
    if (soloAlarmas) {
        filteredData = filteredData.filter(d => Array.isArray(d.alarmas) && d.alarmas.length > 0);
    }

    // --- Filtrar por alarmas seleccionadas (AND combinado) ---
    if (selectedAlarms.length > 0) {
        // Normalizamos a minúsculas para evitar problemas de mayúsculas/espacios
        const selectedLower = selectedAlarms.map(s => s.toLowerCase().trim());

        filteredData = filteredData.filter(d => {
            const alarms = Array.isArray(d.alarmas) ? d.alarmas : [];
            const alarmsLower = alarms.map(a => (a || '').toLowerCase().trim());

            // AND: todas las seleccionadas deben estar en alarmsLower
            return selectedLower.every(sel => alarmsLower.includes(sel));
        });
    }

    // Guardar estado y mostrar
    filtered = true;
    lastFilteredData = filteredData;
    renderTableWithData(filteredData);
}

// Limpia todos los filtros y renderiza toda la tabla
export function clearFilters() {
    // Limpiar inputs si existen
    const fechaInicioEl = document.getElementById('fechaInicio');
    const fechaFinEl = document.getElementById('fechaFin');
    const horaInicioEl = document.getElementById('horaInicio');
    const horaFinEl = document.getElementById('horaFin');
    const soloAlarmasEl = document.getElementById('soloAlarmas');

    if (fechaInicioEl) fechaInicioEl.value = '';
    if (fechaFinEl) fechaFinEl.value = '';
    if (horaInicioEl) horaInicioEl.value = '';
    if (horaFinEl) horaFinEl.value = '';
    if (soloAlarmasEl) soloAlarmasEl.checked = false;

    // desmarcar todas las checkboxes de alarma
    document.querySelectorAll('.alarm-type-checkbox').forEach(cb => { cb.checked = false; });

    // reset estado filtrado
    filtered = false;
    lastFilteredData = [];

    // Renderizar todos los datos actuales
    renderTableWithData(historialData);
}
