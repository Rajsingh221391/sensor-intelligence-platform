package com.sensorintelligence.sensorintelligenceplatform.dto;

public class AnalyticsResponse {

    private String deviceId;

    private Double averageTemperature;
    private Double minimumTemperature;
    private Double maximumTemperature;

    private Double averageHumidity;
    private Double minimumHumidity;
    private Double maximumHumidity;

    private Double averagePressure;
    private Double minimumPressure;
    private Double maximumPressure;

    private Long readingCount;

    public AnalyticsResponse() {
    }

    public AnalyticsResponse(
            String deviceId,
            Double averageTemperature,
            Double minimumTemperature,
            Double maximumTemperature,
            Double averageHumidity,
            Double minimumHumidity,
            Double maximumHumidity,
            Double averagePressure,
            Double minimumPressure,
            Double maximumPressure,
            Long readingCount) {

        this.deviceId = deviceId;
        this.averageTemperature = averageTemperature;
        this.minimumTemperature = minimumTemperature;
        this.maximumTemperature = maximumTemperature;

        this.averageHumidity = averageHumidity;
        this.minimumHumidity = minimumHumidity;
        this.maximumHumidity = maximumHumidity;

        this.averagePressure = averagePressure;
        this.minimumPressure = minimumPressure;
        this.maximumPressure = maximumPressure;

        this.readingCount = readingCount;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public Double getAverageTemperature() {
        return averageTemperature;
    }

    public void setAverageTemperature(Double averageTemperature) {
        this.averageTemperature = averageTemperature;
    }

    public Double getMinimumTemperature() {
        return minimumTemperature;
    }

    public void setMinimumTemperature(Double minimumTemperature) {
        this.minimumTemperature = minimumTemperature;
    }

    public Double getMaximumTemperature() {
        return maximumTemperature;
    }

    public void setMaximumTemperature(Double maximumTemperature) {
        this.maximumTemperature = maximumTemperature;
    }

    public Double getAverageHumidity() {
        return averageHumidity;
    }

    public void setAverageHumidity(Double averageHumidity) {
        this.averageHumidity = averageHumidity;
    }

    public Double getMinimumHumidity() {
        return minimumHumidity;
    }

    public void setMinimumHumidity(Double minimumHumidity) {
        this.minimumHumidity = minimumHumidity;
    }

    public Double getMaximumHumidity() {
        return maximumHumidity;
    }

    public void setMaximumHumidity(Double maximumHumidity) {
        this.maximumHumidity = maximumHumidity;
    }

    public Double getAveragePressure() {
        return averagePressure;
    }

    public void setAveragePressure(Double averagePressure) {
        this.averagePressure = averagePressure;
    }

    public Double getMinimumPressure() {
        return minimumPressure;
    }

    public void setMinimumPressure(Double minimumPressure) {
        this.minimumPressure = minimumPressure;
    }

    public Double getMaximumPressure() {
        return maximumPressure;
    }

    public void setMaximumPressure(Double maximumPressure) {
        this.maximumPressure = maximumPressure;
    }

    public Long getReadingCount() {
        return readingCount;
    }

    public void setReadingCount(Long readingCount) {
        this.readingCount = readingCount;
    }
}
