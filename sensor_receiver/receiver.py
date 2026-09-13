import socket
import re
import json
import requests
from datetime import datetime

HOST = "0.0.0.0"
PORT = 5005

SPRING_BOOT_URL = "http://localhost:8080/api/sensor-readings"

SEPARATOR = "-----------------------------"

DEVICE_ID = "ESP32-001"


def parse_sensor_reading(block):
    text = "\n".join(block)

    # BME280
    bme_match = re.search(
        r"Temp:\s*([-+]?\d+(?:\.\d+)?)\s*°C,\s*"
        r"Humidity:\s*([-+]?\d+(?:\.\d+)?)\s*%,\s*"
        r"Pressure:\s*([-+]?\d+(?:\.\d+)?)\s*hPa",
        text
    )

    # MPU6050 acceleration
    accel_match = re.search(
        r"Accel \(g\):\s*"
        r"X=([-+]?\d+(?:\.\d+)?)\s*"
        r"Y=([-+]?\d+(?:\.\d+)?)\s*"
        r"Z=([-+]?\d+(?:\.\d+)?)",
        text
    )

    # MPU6050 gyroscope
    gyro_match = re.search(
        r"Gyro \(°/s\):\s*"
        r"X=([-+]?\d+(?:\.\d+)?)\s*"
        r"Y=([-+]?\d+(?:\.\d+)?)\s*"
        r"Z=([-+]?\d+(?:\.\d+)?)",
        text
    )

    # SW-420
    vibration_match = re.search(
        r"Digital \(GPIO18\):\s*(\d+)",
        text
    )

    if not bme_match:
        print("ERROR: Could not parse BME280 data.")
        return None

    if not accel_match:
        print("ERROR: Could not parse MPU6050 acceleration.")
        return None

    if not gyro_match:
        print("ERROR: Could not parse MPU6050 gyroscope.")
        return None

    if not vibration_match:
        print("ERROR: Could not parse SW-420 vibration state.")
        return None

    reading = {
        "deviceId": DEVICE_ID,
        "timestamp": datetime.now().isoformat(timespec="seconds"),

        "temperature": float(bme_match.group(1)),
        "humidity": float(bme_match.group(2)),
        "pressure": float(bme_match.group(3)),

        "accelerationX": float(accel_match.group(1)),
        "accelerationY": float(accel_match.group(2)),
        "accelerationZ": float(accel_match.group(3)),

        "gyroscopeX": float(gyro_match.group(1)),
        "gyroscopeY": float(gyro_match.group(2)),
        "gyroscopeZ": float(gyro_match.group(3)),

        "vibrationDetected": vibration_match.group(1) == "1"
    }

    return reading


def send_to_spring_boot(reading):
    try:
        response = requests.post(
            SPRING_BOOT_URL,
            json=reading,
            timeout=10
        )

        if response.status_code in (200, 201):
            print("✓ Saved to Spring Boot / PostgreSQL")
            print("  Response:", response.text)

        else:
            print(
                f"✗ Spring Boot returned HTTP {response.status_code}"
            )
            print("  Response:", response.text[:500])

    except requests.exceptions.RequestException as e:
        print("✗ Could not connect to Spring Boot:")
        print(" ", e)


def process_reading(block):
    print("\n========== COMPLETE SENSOR READING ==========")

    for line in block:
        print(line)

    print("=============================================")

    reading = parse_sensor_reading(block)

    if reading is None:
        return

    print("\n========== PARSED SENSOR DATA ==========")
    print(json.dumps(reading, indent=2))
    print("========================================")

    send_to_spring_boot(reading)


def main():

    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    server.setsockopt(
        socket.SOL_SOCKET,
        socket.SO_REUSEADDR,
        1
    )

    server.bind((HOST, PORT))
    server.listen(1)

    print(f"Sensor receiver listening on {HOST}:{PORT}")
    print("Waiting for the Dell sender...")

    conn, addr = server.accept()

    print(
        f"Connected to sender: "
        f"{addr[0]}:{addr[1]}"
    )

    buffer = []

    try:

        while True:

            data = conn.recv(4096)

            if not data:
                print("Sender disconnected.")
                break

            text = data.decode(
                "utf-8",
                errors="ignore"
            )

            for line in text.splitlines():

                line = line.strip()

                if not line:
                    continue

                print("Received:", line)

                buffer.append(line)

                if line == SEPARATOR:

                    process_reading(buffer)

                    buffer.clear()

    except KeyboardInterrupt:

        print("\nStopping receiver...")

    finally:

        conn.close()
        server.close()


if __name__ == "__main__":
    main()
