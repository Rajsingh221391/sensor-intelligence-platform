const API_BASE_URL = "http://localhost:8080";

export interface ApiSensorReading {
  id: number;
  deviceId: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  ds18b20Temperature: number | null;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  gyroscopeX: number;
  gyroscopeY: number;
  gyroscopeZ: number;
  vibrationDetected: boolean;
}

export interface AiAnalysisResponse {
  analysis: string;
}

export async function getSensorReadings(
  deviceId = "ESP32-001"
): Promise<ApiSensorReading[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/sensor-readings/device/${deviceId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sensor readings: ${response.status}`
    );
  }

  return response.json();
}

export async function getLatestAiAnalysis(
  deviceId = "ESP32-001"
): Promise<AiAnalysisResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/ai-analysis/latest?deviceId=${deviceId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch AI analysis: ${response.status}`
    );
  }

  return response.json();
}