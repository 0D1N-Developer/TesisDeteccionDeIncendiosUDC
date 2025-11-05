// JS/map.js


let L
let map
let tileLayer

const defaultLat = 19.12393986511499
const defaultLon = -104.40001275797306

export function initMap(leaflet) {
    L = leaflet
    map = L.map("map").setView([defaultLat, defaultLon], 15)

    const isDarkMode = document.body.classList.contains("dark-mode")

    if (isDarkMode) {
        tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map)
    } else {
        tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
    }

    L.marker([defaultLat, defaultLon]).addTo(map).bindPopup("Ubicación del Sensor").openPopup()
}

export function updateMapTheme(theme) {
    if (!map || !tileLayer) return

    map.removeLayer(tileLayer)

    if (theme === "dark") {
        tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map)
    } else {
        tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)
    }
}

registerMapThemeUpdater(updateMapTheme)

export function getDefaultCoordinates() {
    return { lat: defaultLat, lon: defaultLon }
}
