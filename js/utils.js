// utils.js

// -----------------------------
// Notificaciones
// -----------------------------
export function showNotification(message, type = "success") {
    const notification = document.getElementById("notification");
    notification.textContent = message;

    if (type === "error") {
        notification.style.backgroundColor = "var(--danger-color)";
    } else if (type === "warning") {
        notification.style.backgroundColor = "var(--warning-color)";
    } else {
        notification.style.backgroundColor = "var(--secondary-color)";
    }

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// -----------------------------
// Formateo
// -----------------------------
export function formatDate(date) {
    return date.toISOString().split("T")[0];
}

export function formatTime(date) {
    return date.toTimeString().split(" ")[0];
}

export function formatNumber(number, decimals = 1) {
    return Number(number).toFixed(decimals);
}

// -----------------------------
// Actualización de lecturas
// -----------------------------
export function updateRealtimeDisplay(sensorData, thresholds) {
    // Mapeo de elementos y umbrales
    const elementsMap = {
        tempC: "tempC",
        tempF: "tempF",
        humedad: "humidity",
        metano: "methane",
        propano: "propane",
        butano: "butane",
        co: "co",
        humo: "smoke"
    };

    let alarmaActiva = false;

    for (const key in elementsMap) {
        const elemId = elementsMap[key];
        const value = parseFloat(sensorData[key]) || 0;

        // Actualizar valor en card
        const elem = document.getElementById(elemId);
        if (elem) elem.textContent = value.toFixed(2);

        // Verificar umbral
        if (thresholds[key] !== undefined && value > thresholds[key]) {
            alarmaActiva = true;

            // Agregar clase de alerta al card
            const card = elem.closest(".value-card");
            if (card) card.classList.add("above-threshold-card");
        } else {
            // Quitar clase si está por debajo
            const card = elem.closest(".value-card");
            if (card) card.classList.remove("above-threshold-card");
        }
    }

    // Actualizar alarmStatus
    const statusElem = document.getElementById("alarmStatus");
    if (statusElem) {
        if (alarmaActiva) {
            statusElem.textContent = "Alarma: Lectura alta!";
            statusElem.classList.remove("normal");
            statusElem.classList.add("alarm");
        } else {
            statusElem.textContent = "Estado: Normal";
            statusElem.classList.remove("alarm");
            statusElem.classList.add("normal");
        }
    }
}

// -----------------------------
// Resaltar filas en tabla (solo visual)
// -----------------------------
export function highlightAlertRows() {
    const table = document.querySelector("#data-table-container table");
    if (!table) return;

    const thresholds = JSON.parse(localStorage.getItem("sensorThresholds") || "{}");

    table.querySelectorAll("tbody tr").forEach(row => {
        let alarmaFila = false;
        row.querySelectorAll("td").forEach(cell => {
            const key = cell.dataset.sensor;
            const value = parseFloat(cell.textContent) || 0;
            if (thresholds[key] !== undefined && value > thresholds[key]) {
                alarmaFila = true;
            }
        });

        if (alarmaFila) {
            row.classList.add("alarm-cell");
        } else {
            row.classList.remove("alarm-cell");
        }
    });
}
