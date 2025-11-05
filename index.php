<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Monitoreo de Sensores</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <div class="container">
        <header>
            <h1>Sistema de Monitoreo de Sensores</h1>
            <button id="dark-mode-toggle" class="theme-toggle">
                <span class="toggle-icon">🌓</span>
            </button>
        </header>

        <div id="alarmStatus" class="normal">Estado: Normal</div>
        <div id="notification" class="notification">Notificación</div>

        <div class="dashboard">
            <!-- Configuración de Umbrales -->
            <div class="dashboard-section">
                <h2>Configuración de Umbrales</h2>
                <div class="thresholds-container">
                    <div class="threshold-group">
                        <label for="tempThreshold">Temperatura (°C):</label>
                        <input type="number" id="tempThreshold" min="0" max="100" step="0.1">
                        <button class="set-btn" data-for="tempThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="humidityThreshold">Humedad (%):</label>
                        <input type="number" id="humidityThreshold" min="0" max="100" step="1">
                        <button class="set-btn" data-for="humidityThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="methaneThreshold">Metano (ppm):</label>
                        <input type="number" id="methaneThreshold" min="0" max="10000" step="1">
                        <button class="set-btn" data-for="methaneThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="propaneThreshold">Propano (ppm):</label>
                        <input type="number" id="propaneThreshold" min="0" max="10000" step="1">
                        <button class="set-btn" data-for="propaneThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="butaneThreshold">Butano (ppm):</label>
                        <input type="number" id="butaneThreshold" min="0" max="10000" step="1">
                        <button class="set-btn" data-for="butaneThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="coThreshold">CO (ppm):</label>
                        <input type="number" id="coThreshold" min="0" max="1000" step="1">
                        <button class="set-btn" data-for="coThreshold">Establecer</button>
                    </div>
                    <div class="threshold-group">
                        <label for="smokeThreshold">Humo (ppm):</label>
                        <input type="number" id="smokeThreshold" min="0" max="5000" step="1">
                        <button class="set-btn" data-for="smokeThreshold">Establecer</button>
                    </div>
                    <div class="threshold-actions">
                        <button id="set-all-thresholds" class="action-btn">Establecer Todos</button>
                        <button id="reset-thresholds" class="action-btn">Restablecer</button>
                    </div>
                </div>
            </div>

            <!-- Lecturas en Tiempo Real -->
            <div class="dashboard-section">
                <h2>Lecturas en Tiempo Real</h2>
                <div class="readings-grid">
                    <div class="value-card">
                        <h3>Temperatura</h3>
                        <div class="value-container">
                            <span id="tempC">--</span><span class="unit">°C</span>
                        </div>
                        <div class="value-container secondary">
                            <span id="tempF">--</span><span class="unit">°F</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>Humedad</h3>
                        <div class="value-container">
                            <span id="humidity">--</span><span class="unit">%</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>Metano</h3>
                        <div class="value-container">
                            <span id="methane">--</span><span class="unit">ppm</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>Propano</h3>
                        <div class="value-container">
                            <span id="propane">--</span><span class="unit">ppm</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>Butano</h3>
                        <div class="value-container">
                            <span id="butane">--</span><span class="unit">ppm</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>CO</h3>
                        <div class="value-container">
                            <span id="co">--</span><span class="unit">ppm</span>
                        </div>
                    </div>
                    <div class="value-card">
                        <h3>Humo</h3>
                        <div class="value-container">
                            <span id="smoke">--</span><span class="unit">ppm</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica de Datos -->
            <div class="dashboard-section">
                <h2>Gráfico de Datos</h2>
                <div id="chart"></div>
            </div>

            <!-- Mapa de Ubicación -->
            <div class="dashboard-section">
                <h2>Ubicación del Sensor</h2>
                <div id="map"></div>
            </div>

            <!-- Historial y Filtros -->
            <div class="dashboard-section">
                <h2>Historial de Datos</h2>
                <div class="filter-container">
                    <div class="filter-group">
                        <label for="fechaInicio">Fecha Inicio:</label>
                        <input type="date" id="fechaInicio">
                    </div>
                    <div class="filter-group">
                        <label for="fechaFin">Fecha Fin:</label>
                        <input type="date" id="fechaFin">
                    </div>
                    <div class="filter-group">
                        <label for="horaInicio">Hora Inicio:</label>
                        <input type="time" id="horaInicio">
                    </div>
                    <div class="filter-group">
                        <label for="horaFin">Hora Fin:</label>
                        <input type="time" id="horaFin">
                    </div>
                    <div class="filter-group checkbox-group" style="display: none">
                        <input type="checkbox" id="soloAlarmas" class="alarm-type-checkbox">
                        <label for="soloAlarmas" class="alarm-type-checkbox-label">Solo mostrar alarmas</label>
                    </div>

                    <div class="filter-group" style="grid-column: 1 / -1;">
                        <div class="alarm-filters-title">Filtrar por tipo de alarma:</div>
                        <div class="alarm-type-filters">
                            <div class="alarm-type-checkbox-container alarm-type-temperatura">
                                <input type="checkbox" id="alarma-temperatura" class="alarm-type-checkbox"
                                    value="Temperatura Alta">
                                <label for="alarma-temperatura" class="alarm-type-checkbox-label">Temperatura</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-humedad">
                                <input type="checkbox" id="alarma-humedad" class="alarm-type-checkbox"
                                    value="Humedad Alta">
                                <label for="alarma-humedad" class="alarm-type-checkbox-label">Humedad</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-metano">
                                <input type="checkbox" id="alarma-metano" class="alarm-type-checkbox"
                                    value="Metano Alto">
                                <label for="alarma-metano" class="alarm-type-checkbox-label">Metano</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-propano">
                                <input type="checkbox" id="alarma-propano" class="alarm-type-checkbox"
                                    value="Propano Alto">
                                <label for="alarma-propano" class="alarm-type-checkbox-label">Propano</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-butano">
                                <input type="checkbox" id="alarma-butano" class="alarm-type-checkbox"
                                    value="Butano Alto">
                                <label for="alarma-butano" class="alarm-type-checkbox-label">Butano</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-co">
                                <input type="checkbox" id="alarma-co" class="alarm-type-checkbox" value="CO Alto">
                                <label for="alarma-co" class="alarm-type-checkbox-label">CO</label>
                            </div>
                            <div class="alarm-type-checkbox-container alarm-type-humo">
                                <input type="checkbox" id="alarma-humo" class="alarm-type-checkbox" value="Humo Alto">
                                <label for="alarma-humo" class="alarm-type-checkbox-label">Humo</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="filter-actions">
                    <button id="applyFilterBtn" class="action-btn">Aplicar Filtro</button>
                    <button id="clearFilterBtn" class="action-btn">Limpiar Filtro</button>
                </div>
            </div>

            <!-- Acciones de Datos -->
            <div class="data-actions">
                <button id="refreshTableBtn" class="action-btn">Actualizar Tabla</button>
                <button id="toggleTableBtn" class="action-btn">Ocultar Tabla</button>
                <button id="exportCsvBtn" class="action-btn">Exportar a CSV</button>
            </div>
            <div id="data-table-container"></div>
        </div>
    </div>

    <footer>
        <p>&copy; 2025 Sistema de Monitoreo de Sensores - Ingenieria De Software</p>
        <p>&copy; Esteban Alcaraz - Laura Castillo</p>
    </footer>

    <!-- Librerías externas -->
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
    <script src="https://cdn.jsdelivr.net/npm/particle-api-js@9.1.0/dist/particle.min.js"></script>


    <!-- Scripts del proyecto -->
    <script src="js/tema.js"></script>
    <script>
        document.addEventListener("DOMContentLoaded", () => {
            if (typeof initTheme === "function") initTheme();
        });
    </script>
    <script type="module" src="js/realtime.js"></script>


    <!-- Scripts de la tabla -->
    <script type="module">
        import { initDataTable } from './js/table.js';
        document.addEventListener("DOMContentLoaded", () => {
            initDataTable();
        });
    </script>

    <!-- Controles de tabla (ocultar y exportar CSV) -->
    <script type="module" src="js/table-controls.js"></script>

    <!-- Otros scripts -->
    <script type="module" src="js/chart.js"></script>
    <script type="module">
        import { initMap } from './js/map.js';
        initMap(L);
    </script>

    <script type="module" src="js/thresholds.js"></script>


</body>

</html>