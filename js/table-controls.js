// table-controls.js
document.addEventListener('DOMContentLoaded', () => {
    // Función para esperar a que los elementos existan en el DOM
    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    callback(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    // Botón para ocultar/mostrar tabla
    waitForElement('#toggleTableBtn', (toggleBtn) => {
        toggleBtn.addEventListener('click', () => {
            const table = document.querySelector('.readings-table');
            const wrapper = document.querySelector('.pagination-wrapper');
            if (!table) return;

            if (table.style.display === 'none') {
                table.style.display = '';
                if (wrapper) wrapper.style.display = '';
                toggleBtn.textContent = 'Ocultar Tabla';
            } else {
                table.style.display = 'none';
                if (wrapper) wrapper.style.display = 'none';
                toggleBtn.textContent = 'Mostrar Tabla';
            }
        });
    });

    // Botón para exportar CSV
    waitForElement('#exportCsvBtn', (exportBtn) => {
        exportBtn.addEventListener('click', () => {
            const table = document.querySelector('.readings-table');
            if (!table) return;

            const rows = table.querySelectorAll('tr');
            const csvContent = Array.from(rows).map(row => {
                const cols = row.querySelectorAll('th, td');
                return Array.from(cols).map(col => `"${col.textContent}"`).join(',');
            }).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `historial_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        });
    });
});
