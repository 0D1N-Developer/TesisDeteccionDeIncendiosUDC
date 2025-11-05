#include "Particle.h"
#include <DHT.h>
#include <HttpClient.h>

// Pines
#define BUZZER_PIN D3
#define DHTPIN D4
#define DHTTYPE DHT11
#define LED_PIN D6
#define MQ2_PIN A0

// Sensores
DHT dht(DHTPIN, DHTTYPE);

// Variables sensores
float temperatureC = 0.0;
float temperatureF = 0.0;
float humidity = 0.0;
float methaneLevel = 0.0;
float propaneLevel = 0.0;
float butaneLevel = 0.0;
float carbonMonoxideLevel = 0.0;
float smokeLevel = 0.0;

// Calibración MQ2
int baseMQ2Value = 0;

// Configuración servidor
const char* server = "192.168.1.153";
const int port = 80;
const char* path = "/TesisDeteccionDeIncendiosEsteban/save_readings.php";

TCPClient client;

// ---------- Alarma SOS (no bloqueante) ----------
volatile bool alarmActive = false;

// Morse timings
const unsigned int DOT = 200;
const unsigned int DASH = DOT * 3;
const unsigned int SYMBOL_GAP = DOT;
const unsigned int LETTER_GAP = DOT * 3;
const unsigned int WORD_GAP = DOT * 7;

// Secuencia SOS: S=... O=--- S=...
const unsigned int sosSequence[] = {
  DOT, SYMBOL_GAP, DOT, SYMBOL_GAP, DOT, LETTER_GAP,
  DASH, SYMBOL_GAP, DASH, SYMBOL_GAP, DASH, LETTER_GAP,
  DOT, SYMBOL_GAP, DOT, SYMBOL_GAP, DOT, WORD_GAP
};
const int SOS_LEN = sizeof(sosSequence)/sizeof(sosSequence[0]);

int sosIndex = 0;
unsigned long sosSegmentStart = 0;
unsigned int sosCurrentDuration = 0;

// Lectura de sensores cada 5 segundos
unsigned long lastReadingTime = 0;
const unsigned long readingInterval = 5000; // 5 segundos

// ---------- Prototipos ----------
int triggerAlarm(String command);
void processSOS();
void sendDataToServer();
void calibrateMQ2();
float calibrateGasReading(float rawReading);
void readSensors();

// ---------- Función remota ----------
int triggerAlarm(String command) {
    if (command.equalsIgnoreCase("on")) {
        alarmActive = true;
        sosIndex = 0;
        sosSegmentStart = 0;
        Serial.println("🔴 Alarma activada (ON)");
        Particle.publish("alarmStatus", "on", PRIVATE);
        return 1;
    } 
    else if (command.equalsIgnoreCase("off")) {
        alarmActive = false;
        digitalWrite(LED_PIN, LOW);
        noTone(BUZZER_PIN);
        sosIndex = 0;
        sosSegmentStart = 0;
        Serial.println("✅ Alarma desactivada (OFF)");
        Particle.publish("alarmStatus", "off", PRIVATE);
        return 1;
    } 
    else if (command.equalsIgnoreCase("toggle")) {
        alarmActive = !alarmActive;
        sosIndex = 0;
        sosSegmentStart = 0;
        Particle.publish("alarmStatus", alarmActive ? "on" : "off", PRIVATE);
        Serial.println(alarmActive ? "🔴 Alarma activada (toggle)" : "✅ Alarma desactivada (toggle)");
        return alarmActive ? 1 : 0;
    }
    return -1;
}

// ---------------- Setup ----------------
void setup() {
    Serial.begin(9600);
    dht.begin();

    pinMode(BUZZER_PIN, OUTPUT);
    pinMode(LED_PIN, OUTPUT);

    Particle.function("alarm", triggerAlarm);

    calibrateMQ2();
}

// ---------------- Loop principal ----------------
void loop() {
    unsigned long now = millis();

    // Procesar SOS continuamente (no bloqueante)
    processSOS();

    // Lectura de sensores cada 5 segundos
    if (now - lastReadingTime >= readingInterval) {
        lastReadingTime = now;
        readSensors();
        sendDataToServer();
    }
}

// ---------------- Lectura de sensores ----------------
void readSensors() {
    float ttmp = dht.readTemperature();
    float hum = dht.readHumidity();

    // ✅ Verificación del DHT11
    // Si el sensor está desconectado o no responde, mandar valores de cero
    if (isnan(ttmp) || isnan(hum)) {
        Serial.println("⚠️ Sensor DHT11 desconectado o sin respuesta, enviando ceros...");
        temperatureC = 0;
        temperatureF = 0;
        humidity = 0;
    } else {
        temperatureC = ttmp;
        humidity = hum;
        temperatureF = (temperatureC * 1.8) + 32;
    }

    // 🔹 Lectura del sensor MQ2 (gases)
    float gasRaw = analogRead(MQ2_PIN);
    float gasCal = calibrateGasReading(gasRaw);

    methaneLevel = gasCal * 0.2;
    propaneLevel = gasCal * 0.3;
    butaneLevel = gasCal * 0.25;
    carbonMonoxideLevel = gasCal * 0.15;
    smokeLevel = gasCal * 0.1;
    if (smokeLevel < 0) smokeLevel = 0;

    // 🔹 Imprimir lecturas
    Serial.printf("TempC: %.2f, TempF: %.2f, Humidity: %.2f\n", temperatureC, temperatureF, humidity);
    Serial.printf("Gases -> Metano: %.2f, Propano: %.2f, Butano: %.2f, CO: %.2f, Humo: %.2f\n",
                  methaneLevel, propaneLevel, butaneLevel, carbonMonoxideLevel, smokeLevel);
}


// ---------------- processSOS (código Morse SOS) ----------------
void processSOS() {
    if (!alarmActive) {
        // Apagar LED y buzzer si la alarma está desactivada
        digitalWrite(LED_PIN, LOW);
        noTone(BUZZER_PIN);
        sosIndex = 0;
        sosSegmentStart = 0;
        return;
    }

    unsigned long now = millis();

    // Si estamos iniciando un nuevo segmento
    if (sosSegmentStart == 0) {
        sosCurrentDuration = sosSequence[sosIndex];
        sosSegmentStart = now;

        if (sosIndex % 2 == 0) { // encendido
            digitalWrite(LED_PIN, HIGH);
            tone(BUZZER_PIN, 1000);
        } else { // apagado
            digitalWrite(LED_PIN, LOW);
            noTone(BUZZER_PIN);
        }
        return;
    }

    // Avanzar al siguiente segmento si ya pasó su duración
    if (now - sosSegmentStart >= sosCurrentDuration) {
        sosIndex++;
        if (sosIndex >= SOS_LEN) sosIndex = 0; // repetir SOS

        sosCurrentDuration = sosSequence[sosIndex];
        sosSegmentStart = now;

        if (sosIndex % 2 == 0) { // encendido
            digitalWrite(LED_PIN, HIGH);
            tone(BUZZER_PIN, 1000);
        } else { // apagado
            digitalWrite(LED_PIN, LOW);
            noTone(BUZZER_PIN);
        }
    }
}

// ---------------- Envío de datos ----------------
void sendDataToServer() {
    if (client.connect(server, port)) {
        String jsonData = String::format(
            "{\"tempC\":%.2f,\"humidity\":%.2f,\"methaneLevel\":%.2f,\"propaneLevel\":%.2f,"
            "\"butaneLevel\":%.2f,\"carbonMonoxideLevel\":%.2f,\"smokeLevel\":%.2f}",
            temperatureC, humidity, methaneLevel, propaneLevel, butaneLevel,
            carbonMonoxideLevel, smokeLevel
        );

        client.println("POST " + String(path) + " HTTP/1.1");
        client.println("Host: " + String(server));
        client.println("Content-Type: application/json");
        client.print("Content-Length: ");
        client.println(jsonData.length());
        client.println();
        client.println(jsonData);

        unsigned long start = millis();
        while ((client.connected() || client.available()) && millis() - start < 3000) {
            if (client.available()) {
                String line = client.readStringUntil('\n');
                if (line.length() > 0) Serial.println(line);
            }
        }

        client.stop();
    } else {
        Serial.println("⚠️ No se pudo conectar al servidor");
    }
}

// ---------------- Calibración MQ2 ----------------
void calibrateMQ2() {
    Serial.println("Calibrando MQ2: espere 60s para calentamiento...");
    int totalValue = 0;
    for (int i = 0; i < 100; i++) {
        totalValue += analogRead(MQ2_PIN);
        delay(50);
    }
    baseMQ2Value = totalValue / 100;
    Serial.printf("Valor base MQ2: %d\n", baseMQ2Value);
}

float calibrateGasReading(float rawReading) {
    float calibrated = rawReading - baseMQ2Value;
    if (calibrated < 0) calibrated = 0;
    return calibrated;
}
