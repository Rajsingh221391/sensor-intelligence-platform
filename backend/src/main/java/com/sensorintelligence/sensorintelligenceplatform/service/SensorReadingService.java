package com.sensorintelligence.sensorintelligenceplatform.service;

import com.sensorintelligence.sensorintelligenceplatform.dto.AnalyticsResponse;
import com.sensorintelligence.sensorintelligenceplatform.entity.SensorReading;
import com.sensorintelligence.sensorintelligenceplatform.repository.SensorReadingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SensorReadingService {

    private final SensorReadingRepository sensorReadingRepository;

    public SensorReadingService(SensorReadingRepository sensorReadingRepository) {
        this.sensorReadingRepository = sensorReadingRepository;
    }

    public SensorReading saveReading(SensorReading reading) {
        return sensorReadingRepository.save(reading);
    }

    public List<SensorReading> getAllReadings() {
        return sensorReadingRepository.findAll();
    }

    public List<SensorReading> getReadingsByDeviceId(String deviceId) {
        return sensorReadingRepository.findByDeviceId(deviceId);
    }

    public SensorReading getLatestReadingByDeviceId(String deviceId) {
        return sensorReadingRepository
                .findTopByDeviceIdOrderByTimestampDesc(deviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No sensor readings found for device: " + deviceId
                        ));
    }

    public List<SensorReading> getReadingsByDeviceAndTimeRange(
            String deviceId,
            LocalDateTime start,
            LocalDateTime end) {

        return sensorReadingRepository
                .findByDeviceIdAndTimestampBetween(
                        deviceId,
                        start,
                        end
                );
    }

    public AnalyticsResponse getAnalytics(
            String deviceId,
            LocalDateTime start,
            LocalDateTime end) {

        return sensorReadingRepository.getAnalytics(
                deviceId,
                start,
                end
        );
    }

    public SensorReading getReadingById(Long id) {
        return sensorReadingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Sensor reading not found"));
    }

    public void deleteReading(Long id) {
        sensorReadingRepository.deleteById(id);
    }
}