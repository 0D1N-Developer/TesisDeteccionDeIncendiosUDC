// table.js

export let historialData = []; // Datos exportables
let currentPage = 1;
let itemsPerPage = 10;

const dataTableContainer = document.getElementById('data-table-container');

// Función para mostrar notificaciones
export function showNotification(message, type = 'error') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// --- Cargar datos desde PHP ---
export async function initDataTable() {
    await cargarDatos();
    renderTableWithData(historialData);
    importarFiltros();
}

// Función que obtiene los datos desde PHP
async function cargarDatos() {
    try {
        const response = await fetch('php/get_historial.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        historialData = await response.json();
    } catch (error) {
        console.error('Error al cargar historial:', error);
        showNotification('Error al cargar historial');
    }
}

// Función para importar filtros
function importarFiltros() {
    import("./tableFilters.js").then(module => module.setupTableFilters());
}

// --- Renderizar tabla ---
export function renderTableWithData(dataArray) {
    if (!dataArray) dataArray = historialData;

    dataTableContainer.innerHTML = '';
    renderPaginationAboveTable(dataArray);

    const table = document.createElement('table');
    table.className = 'readings-table';

    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Temp (°C)</th>
            <th>Temp (°F)</th>
            <th>Humedad (%)</th>
            <th>Metano (ppm)</th>
            <th>Propano (ppm)</th>
            <th>Butano (ppm)</th>
            <th>CO (ppm)</th>
            <th>Humo (ppm)</th>
            <th>Alertas</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = dataArray.slice(startIndex, startIndex + itemsPerPage);

    paginatedData.forEach(row => {
        const tr = document.createElement('tr');
        const alertasArray = Array.isArray(row.alarmas) ? row.alarmas : [];
        const alertasStr = alertasArray.length ? alertasArray.join(', ') : '-';

        tr.innerHTML = `
            <td>${row.fecha}</td>
            <td>${row.hora}</td>
            <td>${row.tempC}</td>
            <td>${row.tempF}</td>
            <td>${row.humedad}</td>
            <td>${row.metano}</td>
            <td>${row.propano}</td>
            <td>${row.butano}</td>
            <td>${row.co}</td>
            <td>${row.humo}</td>
            <td>${alertasStr}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    dataTableContainer.appendChild(table);
}

// --- Paginación ---
function renderPaginationAboveTable(dataArray) {
    let existingWrapper = dataTableContainer.querySelector('.pagination-wrapper');
    if (existingWrapper) existingWrapper.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'pagination-wrapper';

    // Items per page
    const itemsPerPageDiv = document.createElement('div');
    itemsPerPageDiv.className = 'items-per-page';
    itemsPerPageDiv.innerHTML = `
        Mostrar
        <select class="items-per-page-select">
            <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
            <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
            <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
            <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50</option>
            <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100</option>
        </select>
        por página
    `;
    wrapper.appendChild(itemsPerPageDiv);

    const select = itemsPerPageDiv.querySelector('select');
    select.addEventListener('change', () => {
        itemsPerPage = parseInt(select.value);
        currentPage = 1;
        renderTableWithData(dataArray);
    });

    // Paginación numérica
    const paginationControls = document.createElement('div');
    paginationControls.className = 'pagination-controls';

    const totalPages = Math.ceil(dataArray.length / itemsPerPage);

    function createPageButton(page) {
        const btn = document.createElement('button');
        btn.className = 'pagination-button';
        btn.textContent = page;
        if (page === currentPage) btn.disabled = true;
        btn.addEventListener('click', () => {
            currentPage = page;
            renderTableWithData(dataArray);
        });
        return btn;
    }

    // Flechas anterior y siguiente
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-button';
    prevBtn.textContent = '←';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTableWithData(dataArray);
        }
    });
    paginationControls.appendChild(prevBtn);

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) { startPage = 1; endPage = Math.min(5, totalPages); }
    if (currentPage >= totalPages - 2) { endPage = totalPages; startPage = Math.max(1, totalPages - 4); }

    if (startPage > 1) {
        paginationControls.appendChild(createPageButton(1));
        if (startPage > 2) {
            const dotsStart = document.createElement('span');
            dotsStart.textContent = '...';
            dotsStart.className = 'pagination-dots';
            paginationControls.appendChild(dotsStart);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationControls.appendChild(createPageButton(i));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dotsEnd = document.createElement('span');
            dotsEnd.textContent = '...';
            dotsEnd.className = 'pagination-dots';
            paginationControls.appendChild(dotsEnd);
        }
        paginationControls.appendChild(createPageButton(totalPages));
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-button';
    nextBtn.textContent = '→';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTableWithData(dataArray);
        }
    });
    paginationControls.appendChild(nextBtn);

    wrapper.appendChild(paginationControls);
    dataTableContainer.insertBefore(wrapper, dataTableContainer.firstChild);
}

// --- Función para actualizar la tabla manualmente ---
export async function refreshTable() {
    await cargarDatos();
    renderTableWithData(historialData);
}
