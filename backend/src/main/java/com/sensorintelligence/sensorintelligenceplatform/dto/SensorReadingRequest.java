package com.sensorintelligence.sensorintelligenceplatform.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class SensorReadingRequest {

    @NotBlank
    private String deviceId;

    @NotNull
    private LocalDateTime timestamp;

    // BME280
    @Min(-50)
    @Max(100)
    private Double temperature;

    @Min(0)
    @Max(100)
    private Double humidity;

    @Min(300)
    @Max(1100)
    private Double pressure;

    // DS18B20
    private Double ds18b20Temperature;

    // MPU6050 - Accelerometer
    private Double accelerationX;
    private Double accelerationY;
    private Double accelerationZ;

    // MPU6050 - Gyroscope
    private Double gyroscopeX;
    private Double gyroscopeY;
    private Double gyroscopeZ;

    // SW-420
    private Boolean vibrationDetected;

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getHumidity() {
        return humidity;
    }

    public void setHumidity(Double humidity) {
        this.humidity = humidity;
    }

    public Double getPressure() {
        return pressure;
    }

    public void setPressure(Double pressure) {
        this.pressure = pressure;
    }

    public Double getDs18b20Temperature() {
        return ds18b20Temperature;
    }

    public void setDs18b20Temperature(Double ds18b20Temperature) {
        this.ds18b20Temperature = ds18b20Temperature;
    }

    public Double getAccelerationX() {
        return accelerationX;
    }

    public void setAccelerationX(Double accelerationX) {
        this.accelerationX = accelerationX;
    }

    public Double getAccelerationY() {
        return accelerationY;
    }

    public void setAccelerationY(Double accelerationY) {
        this.accelerationY = accelerationY;
    }

    public Double getAccelerationZ() {
        return accelerationZ;
    }

    public void setAccelerationZ(Double accelerationZ) {
        this.accelerationZ = accelerationZ;
    }

    public Double getGyroscopeX() {
        return gyroscopeX;
    }

    public void setGyroscopeX(Double gyroscopeX) {
        this.gyroscopeX = gyroscopeX;
    }

    public Double getGyroscopeY() {
        return gyroscopeY;
    }

    public void setGyroscopeY(Double gyroscopeY) {
        this.gyroscopeY = gyroscopeY;
    }

    public Double getGyroscopeZ() {
        return gyroscopeZ;
    }

    public void setGyroscopeZ(Double gyroscopeZ) {
        this.gyroscopeZ = gyroscopeZ;
    }

    public Boolean getVibrationDetected() {
        return vibrationDetected;
    }

    public void setVibrationDetected(Boolean vibrationDetected) {
        this.vibrationDetected = vibrationDetected;
    }
}
