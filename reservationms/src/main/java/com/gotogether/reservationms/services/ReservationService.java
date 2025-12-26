package com.gotogether.reservationms.services;

import com.gotogether.reservationms.dto.ReservationWithTrajetDTO;
import com.gotogether.reservationms.model.Reservation;
import com.gotogether.reservationms.dto.ReservationDTO;
import com.gotogether.reservationms.dto.TrajetDTO;
import com.gotogether.reservationms.model.enums.Status;
import com.gotogether.reservationms.repository.IReservationRepository;
import com.gotogether.reservationms.repository.TrajetClient;
import com.gotogether.reservationms.repository.NotificationClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReservationService {

    @Autowired
    private IReservationRepository repo;

    @Autowired
    private TrajetClient trajetClient;

    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private RestTemplate restTemplate;

    private static final String USER_SERVICE_URL = "http://utilisateurms/users/id/";

    public Reservation createReservation(Reservation r) {
        r.setStatus(Status.PENDING);
        r.setCreatedAt(LocalDateTime.now());
        Reservation saved = repo.save(r);
        notificationClient.notifyReservationCreated(Map.of(
                "reservationId", saved.getId(),
                "passagerId", saved.getPassagerId(),
                "trajetId", saved.getTrajetId()
        ));
        return saved;
    }

    public Reservation confirmReservation(Long id, String authHeader) {
        Reservation r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation introuvable"));

        TrajetDTO trajet = trajetClient.getTrajet(r.getTrajetId(), authHeader);

        if (trajet.getPlacesDisponibles() < r.getPlacesReservees()) {
            throw new RuntimeException("Pas assez de places disponibles pour confirmer");
        }

        trajetClient.reservePlace(r.getTrajetId(), r.getPlacesReservees(), authHeader);
        r.setStatus(Status.CONFIRMED);
        repo.save(r);

        notificationClient.notifyReservationConfirmed(Map.of(
                "reservationId", r.getId(),
                "passagerId", r.getPassagerId(),
                "trajetId", r.getTrajetId()
        ));

        return r;
    }

    public void refuseReservation(Long reservationId, String authHeader) {
        Reservation res = repo.findById(reservationId).orElseThrow();
        res.setStatus(Status.REFUSED);
        repo.save(res);

        // ✅ Envoyer un Map au lieu d'un int
        Map<String, Integer> body = Map.of("places", res.getPlacesReservees());
        trajetClient.cancelReservation(res.getTrajetId(), body, authHeader);
    }

    public Iterable<ReservationDTO> getReservationsByTrajet(Long trajetId) {
        List<Reservation> reservations = repo.findByTrajetId(trajetId);
        List<ReservationDTO> dtos = new ArrayList<>();
        for (Reservation r : reservations) {
            dtos.add(toDTO(r));
        }
        return dtos;
    }

    public Iterable<ReservationDTO> getByPassagerId(Long passagerId) {
        List<Reservation> reservations = repo.findByPassagerId(passagerId);
        List<ReservationDTO> dtos = new ArrayList<>();
        for (Reservation r : reservations) {
            dtos.add(toDTO(r));
        }
        return dtos;
    }

    private ReservationDTO toDTO(Reservation r) {
        String nom = "Inconnu";
        try {
            Map<?, ?> user = restTemplate.getForObject(USER_SERVICE_URL + r.getPassagerId(), Map.class);
            if (user != null && user.get("fullName") != null) {
                nom = (String) user.get("fullName");
            }
        } catch (Exception e) {
            System.err.println("Impossible de récupérer le nom du passager : " + e.getMessage());
        }
        return new ReservationDTO(
                r.getId(),
                r.getPlacesReservees(),
                r.getStatus().name(),
                r.getPassagerId(),
                nom,
                r.getTrajetId()
        );
    }

    public Iterable<Reservation> getAll() {
        return repo.findAll();
    }

    public void cancelReservation(Long id, Long userId, String authHeader) {
        Reservation r = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation introuvable"));

        if (!r.getPassagerId().equals(userId))
            throw new RuntimeException("Non autorisé");

        // Passer le nombre de places réservées
        trajetClient.cancelReservation(
                r.getTrajetId(),
                Map.of("places", r.getPlacesReservees()),
                authHeader
        );

        repo.deleteById(id);

        notificationClient.notifyReservationCanceled(Map.of(
                "reservationId", r.getId(),
                "trajetId", r.getTrajetId(),
                "conducteurId", trajetClient.getTrajet(r.getTrajetId(), authHeader).getConducteurId()
        ));
    }


    public void deleteReservationsByTrajet(Long trajetId) {
        Iterable<Reservation> reservations = repo.findByTrajetId(trajetId);
        for (Reservation r : reservations) {
            repo.deleteById(r.getId());
        }
    }
    public List<ReservationWithTrajetDTO> getReservationsWithTrajetByPassager(Long passagerId) {
        List<Reservation> reservations = repo.findByPassagerId(passagerId);
        List<ReservationWithTrajetDTO> result = new ArrayList<>();

        for (Reservation r : reservations) {
            TrajetDTO trajet = trajetClient.getTrajet(r.getTrajetId(), null);

            String conducteurNom = "Inconnu";
            if (trajet.getConducteurId() != null) {
                try {
                    Map<?, ?> conducteur = restTemplate.getForObject(
                            USER_SERVICE_URL + trajet.getConducteurId(), Map.class
                    );
                    if (conducteur != null && conducteur.get("fullName") != null) {
                        conducteurNom = (String) conducteur.get("fullName");
                    }
                } catch (Exception ignored) {}
            }

            String passagerNom = "Inconnu";
            try {
                Map<?, ?> passager = restTemplate.getForObject(USER_SERVICE_URL + r.getPassagerId(), Map.class);
                if (passager != null && passager.get("fullName") != null) {
                    passagerNom = (String) passager.get("fullName");
                }
            } catch (Exception ignored) {}

            result.add(new ReservationWithTrajetDTO(
                    r.getId(),
                    r.getPlacesReservees(),
                    r.getStatus().name(),
                    trajet.getId(),
                    trajet.getDepart(),
                    trajet.getArrivee(),
                    trajet.getDateHeureDepart(),
                    trajet.getPrix(),
                    passagerNom,
                    conducteurNom
            ));
        }

        return result;
    }

}
