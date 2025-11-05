<?php

//update_threshold.php

header('Content-Type: application/json');

$host = "localhost";
$dbname = "deteccion_incendios";
$user = "root";
$pass = "";

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['field'], $data['value'])) {
    echo json_encode(['success' => false, 'error' => 'Faltan parámetros']);
    exit;
}

$inputToSensor = [
    'tempThreshold' => 'tempC',
    'humidityThreshold' => 'humedad',
    'methaneThreshold' => 'metano',
    'propaneThreshold' => 'propano',
    'butaneThreshold' => 'butano',
    'coThreshold' => 'co',
    'smokeThreshold' => 'humo'
];

$field = $data['field'];
if (!isset($inputToSensor[$field])) {
    echo json_encode(['success' => false, 'error' => 'Sensor no válido']);
    exit;
}

$sensor = $inputToSensor[$field];
$value = floatval($data['value']);

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "UPDATE thresholds SET valor_umbral_actual = :value WHERE nombre_sensor = :sensor";
    $stmt = $conn->prepare($sql);
    $stmt->bindValue(':value', $value);
    $stmt->bindValue(':sensor', $sensor);
    $stmt->execute();

    echo json_encode(['success' => true, 'rowsAffected' => $stmt->rowCount()]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>