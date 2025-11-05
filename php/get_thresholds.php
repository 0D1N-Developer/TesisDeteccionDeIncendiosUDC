<?php

//Devolver los umbrales (thresholds) de los sensores que están en la base de datos thresholds.
//Se encarga de proporcionar valores que se usan para comparar con las lecturas de los sensores y determinar si hay alertas.

// get_thresholds.php
header('Content-Type: application/json');

// Configuración de la base de datos
$host = "localhost";
$dbname = "deteccion_incendios";
$user = "root";
$pass = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "SELECT nombre_sensor, valor_umbral_default, valor_umbral_actual, descripcion FROM thresholds";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'data' => $result]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>