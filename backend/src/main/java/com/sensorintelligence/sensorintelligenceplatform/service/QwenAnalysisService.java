package com.sensorintelligence.sensorintelligenceplatform.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class QwenAnalysisService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public QwenAnalysisService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    public String analyze(String prompt) {

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", "qwen3.5:9b",
                    "prompt", prompt,
                    "stream", false,
                    "think", false
            );

            String jsonBody =
                    objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "http://localhost:11434/api/generate"
                    ))
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .POST(
                            HttpRequest.BodyPublishers.ofString(
                                    jsonBody
                            )
                    )
                    .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers.ofString()
                    );

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                        "Ollama returned HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            JsonNode jsonResponse =
                    objectMapper.readTree(response.body());

            JsonNode responseNode =
                    jsonResponse.get("response");

            if (responseNode == null) {
                throw new RuntimeException(
                        "Ollama response does not contain 'response'"
                );
            }

            return responseNode.asText();

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to communicate with local Qwen/Ollama",
                    e
            );
        }
    }
}