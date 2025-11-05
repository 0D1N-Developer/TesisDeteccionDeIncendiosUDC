<?php
//check_readings.php

$conn = new mysqli("localhost", "root", "", "deteccion_incendios");
if ($conn->connect_error)
    die("Conexión fallida: " . $conn->connect_error);

$sql = "SELECT * FROM lecturas ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo "<pre>";
    print_r($row);
    echo "</pre>";
} else {
    echo "No hay datos aún.";
}

$conn->close();
?>