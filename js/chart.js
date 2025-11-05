// chart.js
let ApexCharts;
let chart;

const maxDataPoints = 100;

let tempCData = [];
let humidityData = [];
let methaneData = [];
let propaneData = [];
let butaneData = [];
let coData = [];
let smokeData = [];

let seriesVisibility = {
    "Temperatura (°C)": true,
    "Humedad (%)": true,
    "Metano (ppm)": true,
    "Propano (ppm)": true,
    "Butano (ppm)": true,
    "CO (ppm)": true,
    "Humo (ppm)": true
};

function initChart(apexCharts) {
    ApexCharts = apexCharts;
    initializeChart();
}

function initializeChart() {
    const isDarkMode = document.body.classList.contains("dark-mode");

    const options = {
        series: [
            { name: "Temperatura (°C)", data: tempCData },
            { name: "Humedad (%)", data: humidityData },
            { name: "Metano (ppm)", data: methaneData },
            { name: "Propano (ppm)", data: propaneData },
            { name: "Butano (ppm)", data: butaneData },
            { name: "CO (ppm)", data: coData },
            { name: "Humo (ppm)", data: smokeData },
        ],
        chart: {
            height: 450,
            type: "area",
            background: "transparent",
            foreColor: isDarkMode ? "#e0e0e0" : "#333333",
            animations: {
                enabled: true,
                easing: "easeinout",
                speed: 800,
                animateGradually: { enabled: true, delay: 150 },
                dynamicAnimation: { enabled: true, speed: 350 },
            },
            toolbar: { show: true },
            events: {
                legendClick: function (chartContext, seriesIndex, config) {
                    const seriesName = config.config.series[seriesIndex].name;
                    seriesVisibility[seriesName] = !seriesVisibility[seriesName];
                }
            }
        },
        legend: {
            onItemClick: {
                toggleDataSeries: true
            },
            onItemHover: {
                highlightDataSeries: true
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        colors: [
            "#3498db", "#2ecc71", "#ff9800",
            "#9c27b0", "#673ab7", "#f44336", "#607d8b"
        ],
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } },
        markers: { size: 0, hover: { size: 5 } },
        xaxis: { type: "datetime", labels: { datetimeUTC: false, format: "HH:mm:ss" } },
        yaxis: { labels: { formatter: (val) => val.toFixed(1) } },
        tooltip: { x: { format: "dd/MM/yy HH:mm:ss" }, theme: isDarkMode ? "dark" : "light", shared: true, intersect: false },
        legend: { position: "top", horizontalAlign: "center" },
        grid: {
            borderColor: isDarkMode ? "#444" : "#e0e0e0",
            strokeDashArray: 5,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } },
        },
    };

    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}

function updateChartTheme(theme) {
    if (!chart) return;
    chart.updateOptions({
        chart: { foreColor: theme === "dark" ? "#e0e0e0" : "#333333" },
        tooltip: { theme },
        grid: { borderColor: theme === "dark" ? "#444" : "#e0e0e0" },
    });
}

function updateChart(data) {
    if (!chart) return; // ✅ evita error si chart no existe aún

    const timestamp = new Date().getTime();

    tempCData.push([timestamp, data.tempC]);
    humidityData.push([timestamp, data.humedad]);
    methaneData.push([timestamp, data.metano]);
    propaneData.push([timestamp, data.propano]);
    butaneData.push([timestamp, data.butano]);
    coData.push([timestamp, data.co]);
    smokeData.push([timestamp, data.humo]);

    if (tempCData.length > maxDataPoints) {
        tempCData.shift();
        humidityData.shift();
        methaneData.shift();
        propaneData.shift();
        butaneData.shift();
        coData.shift();
        smokeData.shift();
    }

    if (tempCData.length > maxDataPoints) {
        tempCData.shift();
        humidityData.shift();
        methaneData.shift();
        propaneData.shift();
        butaneData.shift();
        coData.shift();
        smokeData.shift();
    }

    // preparar nuevas series
    const newSeries = [
        { name: "Temperatura (°C)", data: tempCData },
        { name: "Humedad (%)", data: humidityData },
        { name: "Metano (ppm)", data: methaneData },
        { name: "Propano (ppm)", data: propaneData },
        { name: "Butano (ppm)", data: butaneData },
        { name: "CO (ppm)", data: coData },
        { name: "Humo (ppm)", data: smokeData }
    ];

    // actualizar los datos
    chart.updateSeries(newSeries, true);

    // ahora, reinstaurar visibilidad segun lo que guardaste
    // recorres seriesVisibility, si es false => ocultas
    Object.keys(seriesVisibility).forEach(seriesName => {
        if (!seriesVisibility[seriesName]) {
            chart.hideSeries(seriesName);
        } else {
            chart.showSeries(seriesName);
        }
    });
}



window.initChart = initChart;
window.updateChart = updateChart;

document.addEventListener("DOMContentLoaded", () => {
    if (window.ApexCharts) initChart(window.ApexCharts);
});
