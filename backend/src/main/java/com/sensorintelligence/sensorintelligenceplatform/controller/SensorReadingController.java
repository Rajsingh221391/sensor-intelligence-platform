package com.sensorintelligence.sensorintelligenceplatform.controller;

import com.sensorintelligence.sensorintelligenceplatform.dto.AnalyticsResponse;
import com.sensorintelligence.sensorintelligenceplatform.dto.SensorReadingRequest;
import com.sensorintelligence.sensorintelligenceplatform.entity.SensorReading;
import com.sensorintelligence.sensorintelligenceplatform.service.SensorReadingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sensor-readings")
public class SensorReadingController {

    private final SensorReadingService sensorReadingService;

    public SensorReadingController(SensorReadingService sensorReadingService) {
        this.sensorReadingService = sensorReadingService;
    }

    @PostMapping
    public ResponseEntity<SensorReading> createReading(
            @Valid @RequestBody SensorReadingRequest request) {

        SensorReading reading = new SensorReading(
                request.getDeviceId(),
                request.getTimestamp(),
                request.getTemperature(),
                request.getHumidity(),
                request.getPressure(),
                request.getDs18b20Temperature(),
                request.getAccelerationX(),
                request.getAccelerationY(),
                request.getAccelerationZ(),
                request.getGyroscopeX(),
                request.getGyroscopeY(),
                request.getGyroscopeZ(),
                request.getVibrationDetected()
        );

        SensorReading savedReading =
                sensorReadingService.saveReading(reading);

        return ResponseEntity.ok(savedReading);
    }

    @GetMapping
    public ResponseEntity<List<SensorReading>> getAllReadings() {

        return ResponseEntity.ok(
                sensorReadingService.getAllReadings()
        );
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<SensorReading>> getReadingsByDeviceId(
            @PathVariable String deviceId) {

        return ResponseEntity.ok(
                sensorReadingService.getReadingsByDeviceId(deviceId)
        );
    }

    @GetMapping("/device/{deviceId}/latest")
    public ResponseEntity<SensorReading> getLatestReadingByDeviceId(
            @PathVariable String deviceId) {

        return ResponseEntity.ok(
                sensorReadingService.getLatestReadingByDeviceId(deviceId)
        );
    }

    @GetMapping("/device/{deviceId}/range")
    public ResponseEntity<List<SensorReading>> getReadingsByTimeRange(
            @PathVariable String deviceId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        return ResponseEntity.ok(
                sensorReadingService.getReadingsByDeviceAndTimeRange(
                        deviceId,
                        start,
                        end
                )
        );
    }

    @GetMapping("/device/{deviceId}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable String deviceId,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {

        AnalyticsResponse analytics =
                sensorReadingService.getAnalytics(
                        deviceId,
                        start,
                        end
                );

        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SensorReading> getReadingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sensorReadingService.getReadingById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReading(
            @PathVariable Long id) {

        sensorReadingService.deleteReading(id);

        return ResponseEntity.noContent().build();
    }
}
