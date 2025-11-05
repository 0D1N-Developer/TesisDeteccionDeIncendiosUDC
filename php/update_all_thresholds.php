<?php
header('Content-Type: application/json');

$host = "localhost";
$dbname = "deteccion_incendios";
$user = "root";
$pass = "";

$data = json_decode(file_get_contents('php://input'), true);

$inputToSensor = [
    'tempThreshold' => 'tempC',
    'humidityThreshold' => 'humedad',
    'methaneThreshold' => 'metano',
    'propaneThreshold' => 'propano',
    'butaneThreshold' => 'butano',
    'coThreshold' => 'co',
    'smokeThreshold' => 'humo'
];

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    foreach ($inputToSensor as $inputField => $sensor) {
        if (isset($data[$inputField])) {
            $value = floatval($data[$inputField]);
            $sql = "UPDATE thresholds SET valor_umbral_actual = :value WHERE nombre_sensor = :sensor";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':value', $value);
            $stmt->bindValue(':sensor', $sensor);
            $stmt->execute();
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>