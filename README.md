# Sensor Intelligence Platform

A complete IoT pipeline that reads live data from a multi-sensor embedded model, transmits it wirelessly, stores it in a database, and uses a locally-run LLM (Qwen 3.5) to generate real-time, human-readable insights from the raw telemetry.

## Overview

This project demonstrates a full sensor-to-insight pipeline:

```
[Sensors] → [ESP32] → [LoRa Radio] → [Receiving Device] → [Network Relay] →
[Database] → [Qwen 3.5 LLM Analysis] → [Live Dashboard]
```

Rather than just displaying raw numbers, the system batches recent sensor readings and feeds them to a locally-hosted large language model, which analyzes trends, cross-sensor correlations, and anomalies — producing insights a human would otherwise have to derive manually.

## Hardware Components

| Component | Purpose |
|---|---|
| ESP32 | Microcontroller that reads all sensors and manages transmission |
| BME280 | Temperature, humidity, and atmospheric pressure sensor (I2C) |
| MPU6050 | 3-axis accelerometer + 3-axis gyroscope for motion/orientation (I2C) |
| SW420 | Digital vibration detection sensor |
| LoRa SX1278 | Long-range, low-power wireless radio module (SPI) for transmitting sensor packets |

## System Architecture

### 1. Data Acquisition (Transmitter)
The ESP32 reads all connected sensors on a fixed interval and packages the readings into a single line of structured data (`key=value` pairs), then transmits that packet wirelessly over LoRa.

### 2. Data Reception
A second device with LoRa receiving hardware picks up each transmitted packet. In setups without a second dedicated LoRa receiver, an alternative relay approach can be used: a computer already connected to the sensor unit via USB reads the serial output directly and forwards it over the local network to the machine running the analysis pipeline.

### 3. Network Relay
A lightweight socket-based sender script reads incoming serial data line by line and streams it over TCP to a listener running on the analysis machine. This decouples data acquisition from data analysis, allowing the two to run on separate machines connected over the same local network.

### 4. Database Storage
Incoming readings are parsed and persisted to a database so that historical data survives beyond the current session and can be queried, aggregated, or replayed later. A simple, appropriate choice for this scale of data is a lightweight embedded database (such as SQLite), storing each reading as a timestamped row with columns for temperature, humidity, pressure, acceleration axes, and vibration state. For higher-throughput or multi-device deployments, a time-series-oriented database is a natural upgrade path, since sensor telemetry is inherently time-indexed data.

A minimal schema looks like this:

```sql
CREATE TABLE readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    temperature REAL,
    humidity REAL,
    pressure REAL,
    accel_x REAL,
    accel_y REAL,
    accel_z REAL,
    vibration INTEGER
);
```

Each incoming packet is parsed and inserted as a new row, giving a complete, queryable history of the system's behavior over time — not just the most recent snapshot.

### 5. AI Analysis with Qwen 3.5
At regular intervals, a batch of recent readings (pulled either from the live stream or queried back out of the database) is compiled into a structured prompt and sent to a locally-hosted Qwen 3.5 model via Ollama's local API. The model is directed to go beyond surface-level restating of values, and instead address:

- **Trend analysis** — is a value rising, falling, or oscillating across the window, not just its instantaneous value
- **Cross-sensor correlation** — do changes in one sensor coincide with changes in another, and what physical cause might explain that
- **Anomaly detection** — which readings deviate meaningfully from the rest, and why that matters
- **Implication** — what the pattern suggests is physically happening to the monitored system

Running the model locally (rather than via a cloud API) keeps the analysis private, removes ongoing API costs, and works entirely offline — useful for a live demo environment where internet access may be unreliable.

### 6. Live Dashboard
A Streamlit-based web dashboard ties everything together: live tables and trend charts broken out per sensor (temperature, humidity, pressure, vibration), an at-a-glance summary of the most recent readings, and a dedicated panel showing Qwen's latest generated insight. The dashboard polls the shared data store on a short interval, so tables and charts update automatically as new readings arrive, without requiring a manual page refresh.

## Setting Up the Pipeline

### Prerequisites
- Arduino IDE with ESP32 board support installed
- Python 3.10+
- [Ollama](https://ollama.com) installed locally, with a Qwen 3.5 model pulled (`ollama pull qwen3.5:9b`)
- Python packages: `pyserial`, `requests`, `streamlit`, `pandas`

### Step 1 — Flash the sensor firmware
Wire the BME280 and MPU6050 to the ESP32's I2C pins, the SW420 to a digital GPIO, and the SX1278 to the SPI pins. Upload firmware that reads each sensor on a loop and prints (or transmits over LoRa) a structured line of readings, for example:

```
temp=24.5,humidity=60,pressure=1013,accel_x=0.02,accel_y=0.01,accel_z=9.8,vibration=0
```

### Step 2 — Relay the data to the analysis machine
On the machine physically connected to the sensor unit, run a script that reads each serial line and forwards it over a TCP socket to the analysis machine's IP address and a chosen port.

### Step 3 — Receive, store, and serve the data
On the analysis machine, run a receiver process that accepts the incoming connection, parses each line into its individual sensor values, inserts it into the database, and makes the latest readings available to both the periodic Qwen analysis step and the live dashboard.

### Step 4 — Run the dashboard
```
streamlit run Dashboard.py
```
This opens a browser-based interface showing live tables, per-sensor trend charts, and Qwen's periodic analysis, all updating automatically as new data arrives.

## Design Notes

- **Batched analysis over per-packet analysis**: sending every individual reading to the LLM would be wasteful and produce shallow, repetitive output. Batching a window of readings (e.g., every 30 seconds) gives the model enough context to detect actual trends and correlations rather than commenting on isolated numbers.
- **Local-first AI**: using Ollama keeps the entire pipeline self-contained and privacy-preserving, with no dependency on external APIs or internet connectivity during a live demonstration.
- **Decoupled architecture**: separating acquisition, storage, analysis, and presentation into distinct stages makes each part independently testable and replaceable — for example, the database or the LLM backend can be swapped without touching the sensor firmware or dashboard code.

## Future Improvements

- Migrate from a flat file/simple database to a proper time-series database for larger deployments
- Add a second dedicated LoRa receiver for true end-to-end wireless reception without relying on a wired relay
- Persist and visualize Qwen's historical insights over time, not just the most recent analysis
- Add alerting when the model flags a significant anomaly

## License

Specify your chosen license here.
