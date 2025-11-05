document.addEventListener("DOMContentLoaded", () => {
    const inputs = {
        tempThreshold: document.getElementById("tempThreshold"),
        humidityThreshold: document.getElementById("humidityThreshold"),
        methaneThreshold: document.getElementById("methaneThreshold"),
        propaneThreshold: document.getElementById("propaneThreshold"),
        butaneThreshold: document.getElementById("butaneThreshold"),
        coThreshold: document.getElementById("coThreshold"),
        smokeThreshold: document.getElementById("smokeThreshold"),
    };

    // Función de notificaciones
    function showNotification(message, type = "success") {
        const notif = document.createElement("div");
        notif.className = `notification show ${type}`;
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.classList.remove("show");
            notif.addEventListener("transitionend", () => notif.remove());
        }, 2500);
    }

    // 🔹 Cargar valores desde la base de datos y actualizar window.thresholds
    fetch("php/get_thresholds.php")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                data.data.forEach(row => {
                    const valor = row.valor_umbral_actual || row.valor_umbral_default || 0;
                    switch (row.nombre_sensor) {
                        case "tempC": inputs.tempThreshold.value = valor; window.thresholds.tempC = valor; break;
                        case "humedad": inputs.humidityThreshold.value = valor; window.thresholds.humedad = valor; break;
                        case "metano": inputs.methaneThreshold.value = valor; window.thresholds.metano = valor; break;
                        case "propano": inputs.propaneThreshold.value = valor; window.thresholds.propano = valor; break;
                        case "butano": inputs.butaneThreshold.value = valor; window.thresholds.butano = valor; break;
                        case "co": inputs.coThreshold.value = valor; window.thresholds.co = valor; break;
                        case "humo": inputs.smokeThreshold.value = valor; window.thresholds.humo = valor; break;
                    }
                });
            } else {
                console.error("Error cargando umbrales:", data.error);
            }
        })
        .catch(err => console.error("Error en fetch:", err));

    // 🔹 Establecer un umbral individual
    document.querySelectorAll(".set-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const field = btn.dataset.for;
            const value = parseFloat(inputs[field].value);

            fetch("php/update_threshold.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ field, value }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showNotification("Umbral actualizado correctamente.", "success");
                        // Actualiza window.thresholds
                        switch (field) {
                            case "tempThreshold": window.thresholds.tempC = value; break;
                            case "humidityThreshold": window.thresholds.humedad = value; break;
                            case "methaneThreshold": window.thresholds.metano = value; break;
                            case "propaneThreshold": window.thresholds.propano = value; break;
                            case "butaneThreshold": window.thresholds.butano = value; break;
                            case "coThreshold": window.thresholds.co = value; break;
                            case "smokeThreshold": window.thresholds.humo = value; break;
                        }
                    } else {
                        showNotification("Error: " + data.error, "error");
                    }
                })
                .catch(err => console.error(err));
        });
    });

    // 🔹 Establecer todos los umbrales
    document.getElementById("set-all-thresholds").addEventListener("click", () => {
        const allValues = {
            tempThreshold: parseFloat(inputs.tempThreshold.value),
            humidityThreshold: parseFloat(inputs.humidityThreshold.value),
            methaneThreshold: parseFloat(inputs.methaneThreshold.value),
            propaneThreshold: parseFloat(inputs.propaneThreshold.value),
            butaneThreshold: parseFloat(inputs.butaneThreshold.value),
            coThreshold: parseFloat(inputs.coThreshold.value),
            smokeThreshold: parseFloat(inputs.smokeThreshold.value)
        };

        fetch("php/update_all_thresholds.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(allValues),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showNotification("Todos los umbrales fueron actualizados.", "success");
                    window.thresholds = {
                        tempC: allValues.tempThreshold,
                        humedad: allValues.humidityThreshold,
                        metano: allValues.methaneThreshold,
                        propano: allValues.propaneThreshold,
                        butano: allValues.butaneThreshold,
                        co: allValues.coThreshold,
                        humo: allValues.smokeThreshold
                    };
                } else {
                    showNotification("Error: " + data.error, "error");
                }
            })
            .catch(err => console.error(err));
    });

    // 🔹 Restablecer umbrales
    document.getElementById("reset-thresholds").addEventListener("click", () => {
        if (!confirm("¿Restablecer todos los umbrales a valores por defecto?")) return;

        fetch("php/reset_thresholds.php")
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    showNotification("Todos los umbrales han sido restablecidos.", "success");
                    location.reload();
                } else {
                    showNotification("Error: " + data.error, "error");
                }
            })
            .catch(err => console.error(err));
    });



});
