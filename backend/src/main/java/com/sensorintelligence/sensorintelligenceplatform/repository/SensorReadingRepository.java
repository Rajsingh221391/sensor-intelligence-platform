package com.sensorintelligence.sensorintelligenceplatform.repository;

import com.sensorintelligence.sensorintelligenceplatform.dto.AnalyticsResponse;
import com.sensorintelligence.sensorintelligenceplatform.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    List<SensorReading> findByDeviceId(String deviceId);

    Optional<SensorReading> findTopByDeviceIdOrderByTimestampDesc(String deviceId);

    List<SensorReading> findByDeviceIdAndTimestampBetween(
            String deviceId,
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
            SELECT new com.sensorintelligence.sensorintelligenceplatform.dto.AnalyticsResponse(
                s.deviceId,
                AVG(s.temperature),
                MIN(s.temperature),
                MAX(s.temperature),
                AVG(s.humidity),
                MIN(s.humidity),
                MAX(s.humidity),
                AVG(s.pressure),
                MIN(s.pressure),
                MAX(s.pressure),
                COUNT(s)
            )
            FROM SensorReading s
            WHERE s.deviceId = :deviceId
            AND s.timestamp BETWEEN :start AND :end
            GROUP BY s.deviceId
            """)
    AnalyticsResponse getAnalytics(
            @Param("deviceId") String deviceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}