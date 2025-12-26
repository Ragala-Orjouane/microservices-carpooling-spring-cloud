package com.gotogether.trajetms.services;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.resolver.DefaultAddressResolverGroup;
import reactor.netty.http.client.HttpClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class GeocodingService {

    private final WebClient client;

    public GeocodingService() {

        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE)
                .responseTimeout(Duration.ofSeconds(8));

        this.client = WebClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("User-Agent", "GoTogether/1.0 (contact: admin@localhost)")
                .build();
    }

    public double[] getCoordinates(String address) {

        if (address == null || address.isBlank()) {
            throw new IllegalArgumentException("Adresse vide");
        }

        String encoded = URLEncoder.encode(address, StandardCharsets.UTF_8);

        String url = "/search?q=" + encoded + "&format=json&limit=1";

        String response;

        try {
            response = client.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Erreur Nominatim (géocodage): " + ex.getMessage(), ex);
        }

        if (response == null || response.isBlank()) {
            throw new RuntimeException("Réponse Nominatim vide");
        }

        JSONArray arr = new JSONArray(response);

        if (arr.isEmpty()) {
            throw new RuntimeException("Adresse introuvable: " + address);
        }

        JSONObject obj = arr.getJSONObject(0);

        double lat = Double.parseDouble(obj.getString("lat"));
        double lon = Double.parseDouble(obj.getString("lon"));

        return new double[]{lat, lon};
    }
}
