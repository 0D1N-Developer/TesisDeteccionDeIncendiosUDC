#include "Particle.h"

// ---------- Pines ----------
#define MQ2_PIN A0
#define LED_PIN D6

// ---------- Variables ----------
int baseMQ2Value = 0;
unsigned long lastReadingTime = 0;
const unsigned long readingInterval = 5000; // cada 5 segundos

// Duración total de calibración (en milisegundos)
const unsigned long calibrationDuration = 48UL * 60UL * 60UL * 1000UL; // 48 horas
unsigned long startTime = 0;

// ---------- Setup ----------
void setup() {
    Serial.begin(9600);
    pinMode(LED_PIN, OUTPUT);
    digitalWrite(LED_PIN, LOW);

    Serial.println("============================================");
    Serial.println("🔥 Iniciando calibración/envejecimiento MQ-2");
    Serial.println("Asegúrate de que el sensor esté en aire limpio.");
    Serial.println("Duración recomendada: 24-48 horas continuas.");
    Serial.println("============================================");

    // Calentamiento inicial de 60 segundos
    Serial.println("Calentando sensor MQ-2 durante 60 segundos...");
    int totalValue = 0;
    for (int i = 0; i < 100; i++) {
        totalValue += analogRead(MQ2_PIN);
        delay(600); // 100 * 0.6s = 60s total
    }
    baseMQ2Value = totalValue / 100;
    Serial.printf("Valor base inicial MQ-2: %d\n", baseMQ2Value);

    startTime = millis();
}

// ---------- Loop principal ----------
void loop() {
    unsigned long now = millis();

    // Lectura del sensor cada 5 segundos
    if (now - lastReadingTime >= readingInterval) {
        lastReadingTime = now;
        int rawValue = analogRead(MQ2_PIN);
        float diff = rawValue - baseMQ2Value;
        if (diff < 0) diff = 0;

        Serial.printf("Lectura: %d | Diferencia base: %.2f\n", rawValue, diff);
    }

    // Si ya pasaron las 48 horas -> parpadeo lento para indicar fin
    if (now - startTime >= calibrationDuration) {
        digitalWrite(LED_PIN, (millis() / 500) % 2); // parpadeo cada 0.5s
    }
}
