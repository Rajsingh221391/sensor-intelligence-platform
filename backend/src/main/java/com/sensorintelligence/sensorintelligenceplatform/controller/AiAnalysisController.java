package com.sensorintelligence.sensorintelligenceplatform.controller;

import com.sensorintelligence.sensorintelligenceplatform.entity.SensorReading;
import com.sensorintelligence.sensorintelligenceplatform.service.QwenAnalysisService;
import com.sensorintelligence.sensorintelligenceplatform.service.SensorReadingService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai-analysis")
@CrossOrigin(origins = "http://localhost:5173")
public class AiAnalysisController {

    private final QwenAnalysisService qwenAnalysisService;
    private final SensorReadingService sensorReadingService;

    public AiAnalysisController(
            QwenAnalysisService qwenAnalysisService,
            SensorReadingService sensorReadingService
    ) {
        this.qwenAnalysisService = qwenAnalysisService;
        this.sensorReadingService = sensorReadingService;
    }

    @GetMapping("/latest")
    public Map<String, String> analyzeLatestReading(
            @RequestParam(defaultValue = "ESP32-001") String deviceId
    ) {

        SensorReading reading =
                sensorReadingService.getLatestReadingByDeviceId(deviceId);

        String prompt = """
                You are an engineering sensor-analysis assistant.

                Analyze ONLY the measurements provided below.
                Do not invent measurements, causes, events, or environmental conditions.
                Clearly distinguish measured values from reasonable interpretations.
                Do not infer altitude or location from pressure.
                A vibration value of false means only that the vibration sensor did not
                report vibration at this sampling point.
                Do not claim that a single accelerometer or gyroscope reading proves
                that the device is stationary, rotating, stable, or experiencing an impact.

                Sensor device: %s
                Timestamp: %s

                BME280:
                Temperature: %s °C
                Humidity: %s %%
                Pressure: %s hPa

                MPU6050:
                Acceleration X: %s g
                Acceleration Y: %s g
                Acceleration Z: %s g
                Gyroscope X: %s °/s
                Gyroscope Y: %s °/s
                Gyroscope Z: %s °/s

                SW-420:
                Vibration detected: %s

                Provide:
                1. Environmental measurements
                2. Motion measurements
                3. Vibration status
                4. Concise engineering interpretation
                5. Any measurement that should be monitored

                Keep the response concise and evidence-based.
                """.formatted(
                reading.getDeviceId(),
                reading.getTimestamp(),
                reading.getTemperature(),
                reading.getHumidity(),
                reading.getPressure(),
                reading.getAccelerationX(),
                reading.getAccelerationY(),
                reading.getAccelerationZ(),
                reading.getGyroscopeX(),
                reading.getGyroscopeY(),
                reading.getGyroscopeZ(),
                reading.getVibrationDetected()
        );

        String analysis =
                qwenAnalysisService.analyze(prompt);

        return Map.of(
                "analysis",
                analysis
        );
    }

    @PostMapping
    public Map<String, String> analyze(
            @RequestBody Map<String, String> request
    ) {

        String prompt = request.get("prompt");

        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException(
                    "Prompt cannot be empty"
            );
        }

        String analysis =
                qwenAnalysisService.analyze(prompt);

        return Map.of(
                "analysis",
                analysis
        );
    }
}
