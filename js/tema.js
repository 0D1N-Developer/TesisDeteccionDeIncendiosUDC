// tema.js

let updateMapThemeCallback = null;
let updateChartThemeCallback = null;

function registerMapThemeUpdater(callback) {
    updateMapThemeCallback = callback;
}

function registerChartThemeUpdater(callback) {
    updateChartThemeCallback = callback;
}

function initTheme() {
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === "dark-mode") {
            if (updateMapThemeCallback) updateMapThemeCallback("dark");
            if (updateChartThemeCallback) updateChartThemeCallback("dark");
        }
    }

    darkModeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", isDark ? "dark-mode" : "");

        if (updateMapThemeCallback) updateMapThemeCallback(isDark ? "dark" : "light");
        if (updateChartThemeCallback) updateChartThemeCallback(isDark ? "dark" : "light");
    });
}
