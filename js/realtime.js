// realtime.js

window.alarmSent = false; // Control del estado actual de alarma
window.thresholds = {
    tempC: 50,
    humedad: 100,
    metano: 500,
    propano: 500,
    butano: 500,
    co: 50,
    humo: 100
};

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 2500);
}

// Actualizar lecturas en pantalla
function updateReadings(data) {
    if (!data) return;

    const alerts = [];

    function checkSensor(id, value, threshold, alertText) {
        const card = document.getElementById(id).closest('.value-card');
        document.getElementById(id).textContent = value.toFixed(1);

        if (value > threshold) {
            card.classList.add('above-threshold-card');
            alerts.push(alertText);
        } else {
            card.classList.remove('above-threshold-card');
        }
    }

    const tempC = parseFloat(data.tempC) || 0;
    const tempF = (tempC * 9 / 5) + 32;
    document.getElementById('tempF').textContent = tempF.toFixed(1);
    checkSensor('tempC', tempC, window.thresholds.tempC, 'Temperatura Alta');

    const humedad = parseFloat(data.humedad || 0);
    checkSensor('humidity', humedad, window.thresholds.humedad, 'Humedad Alta');

    const metano = parseFloat(data.metano || 0);
    checkSensor('methane', metano, window.thresholds.metano, 'Metano Alto');

    const propano = parseFloat(data.propano || 0);
    checkSensor('propane', propano, window.thresholds.propano, 'Propano Alto');

    const butano = parseFloat(data.butano || 0);
    checkSensor('butane', butano, window.thresholds.butano, 'Butano Alto');

    const co = parseFloat(data.co || 0);
    checkSensor('co', co, window.thresholds.co, 'CO Alto');

    const humo = parseFloat(data.humo || 0);
    checkSensor('smoke', humo, window.thresholds.humo, 'Humo Alto');

    const alarmStatus = document.getElementById('alarmStatus');
    if (alerts.length > 0) {
        alarmStatus.classList.remove('normal');
        alarmStatus.classList.add('alarm');
        alarmStatus.textContent = '⚠️ Alerta: ' + alerts.join(', ');
    } else {
        alarmStatus.classList.remove('alarm');
        alarmStatus.classList.add('normal');
        alarmStatus.textContent = 'Estado: Normal';
    }

    if (typeof updateChart === 'function') {
        updateChart({ tempC, tempF, humedad, metano, propano, butano, co, humo });
    }

    checkAndTrigger({ tempC, humedad, metano, propano, butano, co, humo });
}

// Función que decide activar o desactivar la alarma
function checkAndTrigger(readings) {
    if (!window.thresholds) return;

    const mapping = [
        { key: 'tempC', thresholdKey: 'tempC' },
        { key: 'humedad', thresholdKey: 'humedad' },
        { key: 'metano', thresholdKey: 'metano' },
        { key: 'propano', thresholdKey: 'propano' },
        { key: 'butano', thresholdKey: 'butano' },
        { key: 'co', thresholdKey: 'co' },
        { key: 'humo', thresholdKey: 'humo' }
    ];

    let exceeded = false;
    mapping.forEach(m => {
        const current = readings[m.key];
        const thr = window.thresholds[m.thresholdKey];
        if (typeof current === 'number' && typeof thr === 'number') {
            if (current > thr) exceeded = true;
        }
    });

    // ACTIVAR alarma
    if (exceeded && !window.alarmSent) {
        window.alarmSent = true;
        console.log("🚨 Enviando comando ON al dispositivo");
        sendAlarmCommand("on");
    }

    // DESACTIVAR alarma
    if (!exceeded && window.alarmSent) {
        window.alarmSent = false;
        console.log("✅ Enviando comando OFF al dispositivo");
        sendAlarmCommand("off");
    }
}

// Función para mandar comando ON/OFF al Particle
function sendAlarmCommand(action) {
    fetch("php/trigger_device_alarm.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) console.error("Error al activar/desactivar alarma:", data.error);
        })
        .catch(err => console.error(err));
}

// Eventos de notificación de umbrales
document.addEventListener('thresholdUpdated', e => showNotification('Umbral actualizado correctamente', 'success'));
document.addEventListener('allThresholdsUpdated', e => showNotification('Todos los umbrales se han actualizado', 'success'));
document.addEventListener('thresholdsReset', e => showNotification('Todos los umbrales han sido restablecidos', 'success'));

// Obtener lecturas del servidor
function fetchReadings() {
    fetch('get_readings.php')
        .then(response => response.json())
        .then(data => updateReadings(data))
        .catch(err => console.error('Error al obtener lecturas:', err));
}

// Inicializar
fetchReadings();
setInterval(fetchReadings, 5000);
