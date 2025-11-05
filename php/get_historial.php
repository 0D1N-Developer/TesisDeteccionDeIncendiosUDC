<?php
// get_historial.php
// Devuelve todas las lecturas de la base de datos en formato JSON
// para mostrarlas en el dashboard (historial)

header('Content-Type: application/json');

// --- Conexión a la base de datos ---
$servername = "localhost";
$username = "root";
$password = "";
$db = "deteccion_incendios";

$conn = new mysqli($servername, $username, $password, $db);
if ($conn->connect_error) {
    echo json_encode([]);
    exit;
}

// --- Consulta para obtener todas las lecturas ---
$sql = "SELECT * FROM lecturas ORDER BY fecha DESC, hora DESC";
$result = $conn->query($sql);

$data = [];

while ($row = $result->fetch_assoc()) {
    // Lecturas
    $tempC = isset($row['tempC']) ? floatval($row['tempC']) : 0;
    $tempF = $tempC * 9 / 5 + 32;

    $humedad = isset($row['humedad']) ? floatval($row['humedad']) : 0;
    $metano = isset($row['metano']) ? floatval($row['metano']) : 0;
    $propano = isset($row['propano']) ? floatval($row['propano']) : 0;
    $butano = isset($row['butano']) ? floatval($row['butano']) : 0;
    $co = isset($row['co']) ? floatval($row['co']) : 0;
    $humo = isset($row['humo']) ? floatval($row['humo']) : 0;

    // --- ALERTAS: convertir string separado por comas en array con nombres completos ---
    $alarmas = [];
    if (!empty($row['alertas'])) {
        $rawAlerts = array_map('trim', explode(',', $row['alertas']));
        foreach ($rawAlerts as $a) {
            $aLower = strtolower($a);
            if (strpos($aLower, 'tempc') !== false || strpos($aLower, 'temp') !== false)
                $alarmas[] = 'Temperatura Alta';
            else if (strpos($aLower, 'humedad') !== false)
                $alarmas[] = 'Humedad Alta';
            else if (strpos($aLower, 'metano') !== false)
                $alarmas[] = 'Metano Alto';
            else if (strpos($aLower, 'propano') !== false)
                $alarmas[] = 'Propano Alto';
            else if (strpos($aLower, 'butano') !== false)
                $alarmas[] = 'Butano Alto';
            else if (strpos($aLower, 'co') !== false)
                $alarmas[] = 'CO Alto';
            else if (strpos($aLower, 'humo') !== false)
                $alarmas[] = 'Humo Alto';
            else
                $alarmas[] = $a; // cualquier alerta no identificada
        }
    }

    $data[] = [
        "fecha" => $row['fecha'] ?? "",
        "hora" => $row['hora'] ?? "",
        "tempC" => $tempC,
        "tempF" => $tempF,
        "humedad" => $humedad,
        "metano" => $metano,
        "propano" => $propano,
        "butano" => $butano,
        "co" => $co,
        "humo" => $humo,
        "alarmas" => $alarmas
    ];
}

$conn->close();

// --- Devolver todas las lecturas como JSON ---
echo json_encode($data);
?>