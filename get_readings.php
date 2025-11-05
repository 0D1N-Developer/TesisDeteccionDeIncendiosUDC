<?php
// get_readings.php
// Este archivo devuelve la última lectura de la base de datos en formato JSON
// para que se pueda mostrar en los cards en tiempo real

// 1. Configuración de conexión a la base de datos
$host = "localhost";
$user = "root";        // Cambia por tu usuario
$pass = "";     // Cambia por tu contraseña
$db = "deteccion_incendios";

// 2. Crear conexión
$conn = new mysqli($host, $user, $pass, $db);

// 3. Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// 4. Consulta para obtener la última lectura
$sql = "SELECT fecha, hora, tempC, humedad, metano, propano, butano, co, humo, alertas
        FROM lecturas
        ORDER BY id DESC
        LIMIT 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // 5. Convertir la fila en array asociativo
    $row = $result->fetch_assoc();

    // 6. Devolver los datos en formato JSON
    header('Content-Type: application/json');
    echo json_encode($row);
} else {
    // Si no hay datos, devolver un JSON vacío
    echo json_encode([]);
}

// 7. Cerrar conexión
$conn->close();
?>