import requests
import json

SPRING_BOOT_URL = "http://localhost:8080/api/sensor-readings/device/ESP32-001"
OLLAMA_URL = "http://localhost:11434/api/generate"

MODEL_NAME = "qwen3.5:9b"
READING_COUNT = 30


def get_sensor_data():
    response = requests.get(
        SPRING_BOOT_URL,
        timeout=10
    )

    response.raise_for_status()

    readings = response.json()

    # Use the most recent readings
    return readings[-READING_COUNT:]


def build_prompt(readings):

    formatted_data = json.dumps(
        readings,
        indent=2
    )

    prompt = f"""
You are an engineering sensor-data analysis system.

You are analyzing real telemetry collected from:
- BME280: temperature, humidity and atmospheric pressure
- MPU6050: 3-axis acceleration and 3-axis gyroscope
- SW-420: binary vibration detection

Analyze the following recent sensor readings.

DATA:
{formatted_data}

Provide a concise engineering report with exactly these sections:

1. ENVIRONMENTAL TREND
Describe temperature, humidity and pressure trends using actual measured values.

2. MOTION ANALYSIS
Analyze the acceleration and gyroscope values.
Distinguish between stable motion, changing orientation, and significant movement.

3. VIBRATION ANALYSIS
Analyze the SW-420 vibration state.
Mention whether vibration events were detected.

4. ANOMALIES
Identify unusual readings only when supported by the data.
Do not invent anomalies.

5. OVERALL STATUS
Give one status:
NORMAL
CAUTION
ALERT

Then give a 2-3 sentence explanation.

Important rules:
- Use only information supported by the supplied sensor data.
- Do not invent missing sensor values.
- Do not claim a physical cause with certainty unless the data supports it.
- Clearly distinguish measurements from interpretations.
- Reference actual values where useful.
"""


    return prompt


def query_qwen(prompt):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "think": False,
            "options": {
                "temperature": 0.2,
                "num_predict": 500
            }
        },
        timeout=180
    )

    response.raise_for_status()

    result = response.json()

    return result.get(
        "response",
        "(Qwen returned no response)"
    ).strip()


def main():

    print("Fetching sensor data from Spring Boot...")

    readings = get_sensor_data()

    if not readings:
        print("No sensor readings found.")
        return

    print(
        f"Fetched {len(readings)} sensor readings."
    )

    print("\nSending data to Qwen 3.5 9B...\n")

    prompt = build_prompt(readings)

    analysis = query_qwen(prompt)

    print("=" * 60)
    print("QWEN SENSOR INTELLIGENCE REPORT")
    print("=" * 60)

    print(analysis)

    print("=" * 60)


if __name__ == "__main__":
    main()