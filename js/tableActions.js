// tableActions.js
import { loadTableDataWithPagination } from "./table.js";
import { showNotification } from "./utils.js";

// Toggle ocultar/mostrar tabla
export function setupToggleTable() {
    const btn = document.getElementById("toggleTableBtn");
    const tableContainer = document.getElementById("data-table-container");
    if (!btn || !tableContainer) return;

    btn.addEventListener("click", () => {
        if (tableContainer.style.display === "none") {
            tableContainer.style.display = "block";
            btn.textContent = "Ocultar Tabla";
        } else {
            tableContainer.style.display = "none";
            btn.textContent = "Mostrar Tabla";
        }
    });
}

// Exportar tabla a CSV
export function exportTableToCSV(filename = "historial.csv") {
    const table = document.getElementById("readings-table");
    if (!table) return showNotification("No hay datos para exportar", "error");

    const tbody = table.querySelector("tbody");
    if (!tbody || tbody.rows.length === 0) return showNotification("No hay datos para exportar", "error");

    const csv = [];
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent);
    csv.push(headers.join(","));

    Array.from(tbody.rows).forEach(row => {
        const cols = Array.from(row.cells).map(td => {
            const text = td.textContent.replace(/\n/g, " ").replace(/,/g, ";");
            return `"${text}"`;
        });
        csv.push(cols.join(","));
    });

    const csvString = csv.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showNotification("CSV exportado correctamente", "success");
}
