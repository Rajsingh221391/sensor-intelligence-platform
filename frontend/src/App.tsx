import { useEffect, useMemo, useState } from "react";
import {
  getSensorReadings,
  getLatestAiAnalysis,
} from "./api";

import "./App.css";

interface SensorReading {
  id: number;
  time: string;
  temperature: number;
  humidity: number;
  pressure: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
  vibrationDetected: boolean;
}

const initialReadings: SensorReading[] = [
  {
    id: 1,
    time: "00:58:25",
    temperature: 29.24,
    humidity: 75.02,
    pressure: 979.44,
    accelerationX: -0.134,
    accelerationY: 0.225,
    accelerationZ: -0.990,
    gyroscopeX: -0.092,
    gyroscopeY: 1.748,
    gyroscopeZ: -2.901,
    vibrationDetected: false,
  },
];

interface TelemetryChartProps {
  title: string;
  unit: string;
  values: number[];
  labels: string[];
  series?: {
    name: string;
    values: number[];
  }[];
}

function TelemetryChart({
  title,
  unit,
  values,
  labels,
  series,
}: TelemetryChartProps) {
  const chartSeries = series ?? [
    {
      name: title,
      values,
    },
  ];

  const allValues = chartSeries.flatMap(
    (item) => item.values
  );

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = Math.max(
    maxValue - minValue,
    0.001
  );

  const width = 800;
  const height = 240;
  const padding = 24;

  const createPoints = (data: number[]) => {
    return data
      .map((value, index) => {
        const x =
          padding +
          (index /
            Math.max(data.length - 1, 1)) *
            (width - padding * 2);

        const y =
          height -
          padding -
          ((value - minValue) / range) *
            (height - padding * 2);

        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="telemetry-chart">
      <div className="telemetry-chart-header">
        <div>
          <div className="chart-title">
            {title}
          </div>

          <div className="chart-range">
            {minValue.toFixed(2)} —{" "}
            {maxValue.toFixed(2)} {unit}
          </div>
        </div>

        <div className="chart-legend">
          {chartSeries.map((item, index) => (
            <div
              className="legend-item"
              key={item.name}
            >
              <span
                className={`legend-dot legend-${index}`}
              ></span>

              {item.name}
            </div>
          ))}
        </div>
      </div>

      <div className="telemetry-chart-body">
        <div className="y-axis">
          <span>
            {maxValue.toFixed(2)}
          </span>

          <span>
            {(
              (maxValue + minValue) /
              2
            ).toFixed(2)}
          </span>

          <span>
            {minValue.toFixed(2)}
          </span>
        </div>

        <div className="svg-container">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <line
              x1="24"
              y1="24"
              x2="776"
              y2="24"
              className="grid-line"
            />

            <line
              x1="24"
              y1="120"
              x2="776"
              y2="120"
              className="grid-line"
            />

            <line
              x1="24"
              y1="216"
              x2="776"
              y2="216"
              className="grid-line"
            />

            {chartSeries.map(
              (item, index) => (
                <polyline
                  key={item.name}
                  points={createPoints(
                    item.values
                  )}
                  className={`telemetry-line line-${index}`}
                />
              )
            )}
          </svg>
        </div>
      </div>

      <div className="x-axis">
        <span>{labels[0]}</span>

        <span>
          {
            labels[
              Math.floor(
                labels.length / 2
              )
            ]
          }
        </span>

        <span>
          {labels[labels.length - 1]}
        </span>
      </div>
    </div>
  );
}

function App() {
  const [readings, setReadings] =
    useState<SensorReading[]>(
      initialReadings
    );

  const [activeSection, setActiveSection] =
    useState("Overview");

  const [dataLoading, setDataLoading] =
    useState(true);

  const [dataError, setDataError] =
    useState(false);

  const [dataStatus, setDataStatus] =
    useState<
      "CONNECTING" |
      "LIVE" |
      "STORED" |
      "ERROR"
    >("CONNECTING");

  const [aiAnalysis, setAiAnalysis] =
    useState(
      "Waiting for Qwen analysis..."
    );

  const [aiLoading, setAiLoading] =
    useState(true);

  const [aiError, setAiError] =
    useState(false);

  const latest =
    readings[readings.length - 1];

  const vibrationAlert =
    latest.vibrationDetected;

  const environmentalWarning =
    latest.temperature > 35 ||
    latest.humidity > 85 ||
    latest.pressure < 950 ||
    latest.pressure > 1050;

  const motionWarning =
    Math.abs(latest.accelerationX) > 2 ||
    Math.abs(latest.accelerationY) > 2 ||
    Math.abs(latest.accelerationZ) > 2 ||
    Math.abs(latest.gyroscopeX) > 100 ||
    Math.abs(latest.gyroscopeY) > 100 ||
    Math.abs(latest.gyroscopeZ) > 100;

  const systemStatus =
    vibrationAlert ||
    environmentalWarning ||
    motionWarning
      ? "ALERT"
      : "NORMAL";

  useEffect(() => {
    async function loadSensorData() {
      try {
        setDataLoading(true);
        setDataError(false);
        setDataStatus("CONNECTING");

        const data =
          await getSensorReadings(
            "ESP32-001"
          );

        const formattedReadings: SensorReading[] =
          data.map((reading) => ({
            id: reading.id,

            time: new Date(
              reading.timestamp
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),

            temperature:
              reading.temperature,

            humidity:
              reading.humidity,

            pressure:
              reading.pressure,

            accelerationX:
              reading.accelerationX,

            accelerationY:
              reading.accelerationY,

            accelerationZ:
              reading.accelerationZ,

            gyroscopeX:
              reading.gyroscopeX,

            gyroscopeY:
              reading.gyroscopeY,

            gyroscopeZ:
              reading.gyroscopeZ,

            vibrationDetected:
              reading.vibrationDetected,
          }));

        if (
          formattedReadings.length > 0
        ) {
          setReadings(
            formattedReadings
          );

          const latestApiReading =
            data[data.length - 1];

          const latestTimestamp =
            new Date(
              latestApiReading.timestamp
            ).getTime();

          const currentTime =
            Date.now();

          const ageInMilliseconds =
            currentTime -
            latestTimestamp;

          const LIVE_THRESHOLD =
            10 * 1000;

          if (
            ageInMilliseconds >= 0 &&
            ageInMilliseconds <=
              LIVE_THRESHOLD
          ) {
            setDataStatus("LIVE");
          } else {
            setDataStatus("STORED");
          }
        } else {
          setDataStatus("STORED");
        }
      } catch (error) {
        console.error(
          "Failed to load sensor data:",
          error
        );

        setDataError(true);
        setDataStatus("ERROR");
      } finally {
        setDataLoading(false);
      }
    }

    async function loadAiAnalysis() {
      try {
        setAiLoading(true);
        setAiError(false);

        const result =
          await getLatestAiAnalysis(
            "ESP32-001"
          );

        setAiAnalysis(
          result.analysis
        );
      } catch (error) {
        console.error(
          "Failed to load AI analysis:",
          error
        );

        setAiError(true);

        setAiAnalysis(
          "Unable to retrieve Qwen analysis."
        );
      } finally {
        setAiLoading(false);
      }
    }

    loadSensorData();
    loadAiAnalysis();
  }, []);

  const chartLabels = useMemo(
    () =>
      readings.map(
        (reading) => reading.time
      ),
    [readings]
  );

  const temperaturePoints = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.temperature
      ),
    [readings]
  );

  const humidityPoints = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.humidity
      ),
    [readings]
  );

  const pressurePoints = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.pressure
      ),
    [readings]
  );

  const accelerationX = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.accelerationX
      ),
    [readings]
  );

  const accelerationY = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.accelerationY
      ),
    [readings]
  );

  const accelerationZ = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.accelerationZ
      ),
    [readings]
  );

  const gyroscopeX = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.gyroscopeX
      ),
    [readings]
  );

  const gyroscopeY = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.gyroscopeY
      ),
    [readings]
  );

  const gyroscopeZ = useMemo(
    () =>
      readings.map(
        (reading) =>
          reading.gyroscopeZ
      ),
    [readings]
  );

  const dataModeLabel =
    dataStatus === "CONNECTING"
      ? "CONNECTING"
      : dataStatus === "ERROR"
        ? "CONNECTION ERROR"
        : dataStatus === "LIVE"
          ? "LIVE DATA"
          : "STORED DATA";

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-mark">
            SI
          </div>

          <div>
            <div className="logo-title">
              SENSOR
            </div>

            <div className="logo-subtitle">
              INTELLIGENCE
            </div>
          </div>

        </div>

        <div className="sidebar-label">
          MONITORING
        </div>

        <nav>

          {[
            "Overview",
            "Telemetry",
            "Analytics",
            "AI Insights",
          ].map((item) => (
            <button
              key={item}
              className={`nav-item ${
                activeSection === item
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection(
                  item
                )
              }
            >

              <span className="nav-icon">
                {item === "Overview" &&
                  "◈"}

                {item === "Telemetry" &&
                  "⌁"}

                {item === "Analytics" &&
                  "◫"}

                {item ===
                  "AI Insights" &&
                  "✦"}
              </span>

              {item}

            </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="connection-box">

            <div className="connection-header">

              <span className="live-dot"></span>

              SYSTEM ONLINE

            </div>

            <div className="connection-text">
              Local monitoring
              environment
            </div>

          </div>

          <div className="version">
            SENSOR INTELLIGENCE
            PLATFORM
            <br />
            v0.1.0
          </div>

        </div>

      </aside>

      <main className="main-content">

        <header className="topbar">

          <div>

            <div className="breadcrumb">
              MONITORING /{" "}
              {activeSection.toUpperCase()}
            </div>

            <h1>
              {activeSection}
            </h1>

          </div>

          <div className="topbar-right">

            <div className="data-mode">

              <span className="mode-dot"></span>

              {dataModeLabel}

            </div>

            <div className="device-pill">

              <span className="live-dot"></span>

              ESP32-001

            </div>

          </div>

        </header>

        <section className="overview-header">

          <div>

            <div className="section-tag">
              DEVICE OVERVIEW
            </div>

            <h2>
              Environmental
              <span>
                {" "}
                intelligence
              </span>
            </h2>

            <p>
              Real-time telemetry from
              the ESP32 sensor platform
              with local AI analysis.
            </p>

          </div>

          <div className="last-update">

            <span>
              LAST UPDATE
            </span>

            <strong>
              {latest.time}
            </strong>

          </div>

        </section>

        <section className="metrics-grid">

          <MetricCard
            label="TEMPERATURE"
            value={latest.temperature.toFixed(
              2
            )}
            unit="°C"
            description="BME280"
            icon="TEMP"
          />

          <MetricCard
            label="HUMIDITY"
            value={latest.humidity.toFixed(
              2
            )}
            unit="%"
            description="Relative humidity"
            icon="HUM"
          />

          <MetricCard
            label="PRESSURE"
            value={latest.pressure.toFixed(
              2
            )}
            unit="hPa"
            description="Atmospheric pressure"
            icon="PRS"
          />

          <MetricCard
            label="VIBRATION"
            value={
              latest.vibrationDetected
                ? "DETECTED"
                : "CLEAR"
            }
            unit=""
            description="SW-420 detector"
            icon="VIB"
            status={
              !latest.vibrationDetected
            }
          />

        </section>

        <section className="chart-grid">

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  ENVIRONMENTAL TREND
                </div>

                <h3>
                  Temperature
                </h3>

              </div>

              <div className="chart-current">
                {latest.temperature.toFixed(
                  2
                )}{" "}
                °C
              </div>

            </div>

            <TelemetryChart
              title="Temperature"
              unit="°C"
              values={
                temperaturePoints
              }
              labels={chartLabels}
            />

          </div>

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  ENVIRONMENTAL TREND
                </div>

                <h3>
                  Humidity
                </h3>

              </div>

              <div className="chart-current">
                {latest.humidity.toFixed(
                  2
                )}{" "}
                %
              </div>

            </div>

            <TelemetryChart
              title="Humidity"
              unit="%"
              values={
                humidityPoints
              }
              labels={chartLabels}
            />

          </div>

          <div className="panel full-width-chart">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  ATMOSPHERIC TREND
                </div>

                <h3>
                  Pressure
                </h3>

              </div>

              <div className="chart-current">
                {latest.pressure.toFixed(
                  2
                )}{" "}
                hPa
              </div>

            </div>

            <TelemetryChart
              title="Pressure"
              unit="hPa"
              values={
                pressurePoints
              }
              labels={chartLabels}
            />

          </div>

        </section>

        <section className="motion-section">

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  MOTION TELEMETRY
                </div>

                <h3>
                  Acceleration
                </h3>

              </div>

              <span className="sensor-chip">
                MPU6050 · g
              </span>

            </div>

            <TelemetryChart
              title="Acceleration"
              unit="g"
              values={
                accelerationX
              }
              labels={chartLabels}
              series={[
                {
                  name: "X Axis",
                  values:
                    accelerationX,
                },
                {
                  name: "Y Axis",
                  values:
                    accelerationY,
                },
                {
                  name: "Z Axis",
                  values:
                    accelerationZ,
                },
              ]}
            />

          </div>

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  ROTATIONAL MOTION
                </div>

                <h3>
                  Gyroscope
                </h3>

              </div>

              <span className="sensor-chip">
                MPU6050 · °/s
              </span>

            </div>

            <TelemetryChart
              title="Gyroscope"
              unit="°/s"
              values={
                gyroscopeX
              }
              labels={chartLabels}
              series={[
                {
                  name: "X Axis",
                  values:
                    gyroscopeX,
                },
                {
                  name: "Y Axis",
                  values:
                    gyroscopeY,
                },
                {
                  name: "Z Axis",
                  values:
                    gyroscopeZ,
                },
              ]}
            />

          </div>

        </section>

        <section className="axis-grid">

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  CURRENT MOTION
                </div>

                <h3>
                  Acceleration
                </h3>

              </div>

              <span className="sensor-chip">
                {dataStatus ===
                "LIVE"
                  ? "LIVE"
                  : "STORED"}
              </span>

            </div>

            <div className="axis-list">

              <AxisRow
                axis="X"
                value={
                  latest.accelerationX
                }
                unit="g"
              />

              <AxisRow
                axis="Y"
                value={
                  latest.accelerationY
                }
                unit="g"
              />

              <AxisRow
                axis="Z"
                value={
                  latest.accelerationZ
                }
                unit="g"
              />

            </div>

          </div>

          <div className="panel">

            <div className="panel-header">

              <div>

                <div className="panel-label">
                  CURRENT ROTATION
                </div>

                <h3>
                  Gyroscope
                </h3>

              </div>

              <span className="sensor-chip">
                {dataStatus ===
                "LIVE"
                  ? "LIVE"
                  : "STORED"}
              </span>

            </div>

            <div className="axis-list">

              <AxisRow
                axis="X"
                value={
                  latest.gyroscopeX
                }
                unit="°/s"
              />

              <AxisRow
                axis="Y"
                value={
                  latest.gyroscopeY
                }
                unit="°/s"
              />

              <AxisRow
                axis="Z"
                value={
                  latest.gyroscopeZ
                }
                unit="°/s"
              />

            </div>

          </div>

        </section>

        <section className="ai-section">

          <div className="ai-panel">

            <div className="ai-top">

              <div className="ai-title">

                <div className="ai-icon">
                  ✦
                </div>

                <div>

                  <div className="panel-label">
                    LOCAL AI ENGINE
                  </div>

                  <h3>
                    Qwen Sensor
                    Intelligence
                  </h3>

                </div>

              </div>

              <div className="qwen-badge">
                QWEN 3.5 · 9B
              </div>

            </div>

            <div className="ai-body">

              <div className="ai-status">

                <div className="status-label">
                  OVERALL STATUS
                </div>

                <div
                  className={`status-value ${
                    systemStatus ===
                    "ALERT"
                      ? "status-alert"
                      : ""
                  }`}
                >

                  <span className="large-status-dot"></span>

                  {systemStatus}

                </div>

              </div>

              <div className="ai-analysis">

                <div className="analysis-label">
                  LATEST ANALYSIS
                </div>

                <p>
                  {aiLoading
                    ? "Qwen is analyzing the latest sensor reading..."
                    : aiError
                      ? "Unable to retrieve Qwen analysis."
                      : aiAnalysis}
                </p>

                <div className="analysis-meta">

                  ANALYSIS SOURCE

                  <strong>
                    LOCAL OLLAMA / QWEN 3.5 9B
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section className="panel readings-panel">

          <div className="panel-header">

            <div>

              <div className="panel-label">
                TELEMETRY HISTORY
              </div>

              <h3>
                Recent readings
              </h3>

            </div>

            <span className="reading-count">
              {readings.length}{" "}
              records
            </span>

          </div>

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    TIME
                  </th>

                  <th>
                    TEMP
                  </th>

                  <th>
                    HUMIDITY
                  </th>

                  <th>
                    PRESSURE
                  </th>

                  <th>
                    ACCEL Z
                  </th>

                  <th>
                    VIBRATION
                  </th>

                </tr>

              </thead>

              <tbody>

                {[...readings]
                  .reverse()
                  .slice(0, 7)
                  .map(
                    (
                      reading
                    ) => (
                      <tr
                        key={
                          reading.id
                        }
                      >

                        <td className="time-cell">
                          {
                            reading.time
                          }
                        </td>

                        <td>
                          {reading.temperature.toFixed(
                            2
                          )}{" "}
                          °C
                        </td>

                        <td>
                          {reading.humidity.toFixed(
                            2
                          )}{" "}
                          %
                        </td>

                        <td>
                          {reading.pressure.toFixed(
                            2
                          )}{" "}
                          hPa
                        </td>

                        <td>
                          {reading.accelerationZ.toFixed(
                            3
                          )}{" "}
                          g
                        </td>

                        <td>

                          <span
                            className={
                              reading.vibrationDetected
                                ? "vibration detected"
                                : "vibration clear"
                            }
                          >

                            <span></span>

                            {reading.vibrationDetected
                              ? "DETECTED"
                              : "CLEAR"}

                          </span>

                        </td>

                      </tr>
                    )
                  )}

              </tbody>

            </table>

          </div>

        </section>

        <footer className="footer">

          <span>
            SENSOR INTELLIGENCE
            PLATFORM
          </span>

          <span>
            ESP32 · BME280 ·
            MPU6050 · SW-420 ·
            QWEN
          </span>

        </footer>

      </main>

    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  description: string;
  icon: string;
  status?: boolean;
}

function MetricCard({
  label,
  value,
  unit,
  description,
  icon,
  status,
}: MetricCardProps) {
  return (
    <div className="metric-card">

      <div className="metric-top">

        <span className="metric-label">
          {label}
        </span>

        <span className="metric-icon">
          {icon}
        </span>

      </div>

      <div
        className={`metric-number ${
          status === true
            ? "status-clear"
            : ""
        }`}
      >

        {value}

        {unit && (
          <span className="metric-unit">
            {unit}
          </span>
        )}

      </div>

      <div className="metric-bottom">

        <span className="metric-indicator"></span>

        {description}

      </div>

    </div>
  );
}

interface AxisRowProps {
  axis: string;
  value: number;
  unit: string;
}

function AxisRow({
  axis,
  value,
  unit,
}: AxisRowProps) {
  const percentage = Math.min(
    Math.abs(value) * 100,
    100
  );

  return (
    <div className="axis-row">

      <div className="axis-name">

        <span>{axis}</span>

        Axis

      </div>

      <div className="axis-bar">

        <div
          className="axis-fill"
          style={{
            width: `${percentage}%`,
          }}
        ></div>

      </div>

      <div className="axis-value">

        {value.toFixed(3)}

        <span>
          {unit}
        </span>

      </div>

    </div>
  );
}

export default App;