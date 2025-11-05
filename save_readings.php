<?php
// save_readings.php
// Guarda lecturas de sensores y genera alertas si sobrepasan los thresholds

header('Content-Type: application/json');

// --- Conexión a la base de datos ---
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "deteccion_incendios";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Conexión fallida: " . $conn->connect_error]);
    exit;
}

// --- Obtener JSON enviado por Particle ---
$data = file_get_contents('php://input');
$json = json_decode($data, true);

if (!$json) {
    echo json_encode(["status" => "error", "message" => "JSON inválido"]);
    exit;
}

// --- Variables de sensores ---
$tempC = $json['tempC'] ?? 0;
$humidity = $json['humidity'] ?? 0;
$methane = $json['methaneLevel'] ?? 0;
$propane = $json['propaneLevel'] ?? 0;
$butane = $json['butaneLevel'] ?? 0;
$co = $json['carbonMonoxideLevel'] ?? 0;
$smoke = $json['smokeLevel'] ?? 0;

// --- Obtener los thresholds actuales de la tabla thresholds ---
$sqlThresholds = "SELECT * FROM thresholds";
$resultThresholds = $conn->query($sqlThresholds);

$temCThreshold = 9999;
$humiThreshold = 9999;
$methThreshold = 9999;
$propThreshold = 9999;
$butaThreshold = 9999;
$caMoThreshold = 9999;
$smokThreshold = 9999;

if ($resultThresholds && $resultThresholds->num_rows > 0) {
    // Tomar el valor actual de cada sensor
    while ($row = $resultThresholds->fetch_assoc()) {
        switch ($row['nombre_sensor']) {
            case 'tempC':
                $temCThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'humedad':
                $humiThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'metano':
                $methThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'propano':
                $propThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'butano':
                $butaThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'co':
                $caMoThreshold = floatval($row['valor_umbral_actual']);
                break;
            case 'humo':
                $smokThreshold = floatval($row['valor_umbral_actual']);
                break;
        }
    }
}

// --- Verificar alertas ---
$alerts = [];

if ($tempC >= $temCThreshold)
    $alerts[] = "TempC: $tempC ≥ $temCThreshold";
if ($humidity >= $humiThreshold)
    $alerts[] = "Humedad: $humidity ≥ $humiThreshold";
if ($methane >= $methThreshold)
    $alerts[] = "Metano: $methane ≥ $methThreshold";
if ($propane >= $propThreshold)
    $alerts[] = "Propano: $propane ≥ $propThreshold";
if ($butane >= $butaThreshold)
    $alerts[] = "Butano: $butane ≥ $butaThreshold";
if ($co >= $caMoThreshold)
    $alerts[] = "CO: $co ≥ $caMoThreshold";
if ($smoke >= $smokThreshold)
    $alerts[] = "Humo: $smoke ≥ $smokThreshold";

$alerts_str = !empty($alerts) ? implode(", ", $alerts) : null;

// --- Insertar lectura en la tabla lecturas ---
$stmt = $conn->prepare("INSERT INTO lecturas
    (fecha, hora, tempC, humedad, metano, propano, butano, co, humo, alertas, registrado_en)
    VALUES (CURDATE(), CURTIME(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

$stmt->bind_param(
    "ddddddds",
    $tempC,
    $humidity,
    $methane,
    $propane,
    $butane,
    $co,
    $smoke,
    $alerts_str
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "ok",
        "message" => "Datos guardados",
        "alertas" => $alerts
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>