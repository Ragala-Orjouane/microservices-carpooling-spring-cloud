package com.gotogether.trajetms.services;

import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.ProxyProvider;
import reactor.netty.resources.ConnectionProvider;
import reactor.netty.transport.TransportConfig;
import reactor.netty.http.client.HttpClientResponse;

import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import io.netty.resolver.DefaultAddressResolverGroup;

import java.time.Duration;

@Service
public class OsrmService {

    private final WebClient client;

    public OsrmService() {

        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE)
                .responseTimeout(Duration.ofSeconds(8));

        this.client = WebClient.builder()
                // OSRM PLUS STABLE
                .baseUrl("https://routing.openstreetmap.de")
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    public double getDistanceInKm(double lat1, double lon1, double lat2, double lon2) {

        String url = "/routed-car/route/v1/driving/"
                + lon1 + "," + lat1 + ";"
                + lon2 + "," + lat2
                + "?overview=false";

        String response;

        try {
            response = client.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Erreur OSRM (distance): " + ex.getMessage(), ex);
        }

        if (response == null || response.isBlank()) {
            throw new RuntimeException("Réponse OSRM vide");
        }

        JSONObject json = new JSONObject(response);

        if (!json.has("routes") || json.getJSONArray("routes").isEmpty()) {
            throw new RuntimeException("Aucune route trouvée par OSRM");
        }

        double distanceMeters = json
                .getJSONArray("routes")
                .getJSONObject(0)
                .getDouble("distance");

        return distanceMeters / 1000.0;
    }
}
