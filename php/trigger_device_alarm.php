<?php

//Activar, desactivar o alternar la alarma del Particle desde un script PHP o una interfaz web.
//Básicamente es un puente entre tu web/servidor y el Particle usando la API de Particle Cloud.

//trigger_device_alarm.php

header('Content-Type: application/json');

// Rellenar con tus datos (mejor guardarlos fuera del webroot o en variables de entorno)
$deviceId = "1c002a000847313037363132";
$accessToken = "6f34d66ad6189a4e6632075ffdd36fc360fcbab1";

$input = json_decode(file_get_contents('php://input'), true);
$action = isset($input['action']) ? $input['action'] : 'on';

if (!in_array($action, ['on', 'off', 'toggle'])) {
    echo json_encode(['success' => false, 'error' => 'Action inválida']);
    exit;
}

$url = "https://api.particle.io/v1/devices/$deviceId/alarm";
$data = http_build_query(['arg' => $action, 'access_token' => $accessToken]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$err = curl_error($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($err) {
    echo json_encode(['success' => false, 'error' => $err]);
} else {
    echo json_encode(['success' => true, 'response' => $response, 'http_code' => $http]);
}
