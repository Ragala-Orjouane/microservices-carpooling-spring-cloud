package com.gotogether.notificationms.services;

import com.gotogether.notificationms.repository.ReservationClient;
import com.gotogether.notificationms.repository.TrajetClient;
import com.gotogether.notificationms.repository.UtilisateurClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private ReservationClient reservationClient;

    @Autowired
    private NotificationStore notificationStore;
    @Autowired
    private TrajetClient trajetClient;
    @Autowired
    private UtilisateurClient utilisateurClient;

    public void handleReservationEvent(Map<String, Object> payload) {
        Long reservationId = ((Number) payload.get("reservationId")).longValue();
        Long passagerId = ((Number) payload.get("passagerId")).longValue();
        Long trajetId = ((Number) payload.get("trajetId")).longValue();

        System.out.println("🔔 Notification réservation reçue: " + payload);

        // Notifier le passager (au minimum)
        try {
            // Enrichir avec les infos du trajet
            String msgPassenger = "Votre réservation #" + reservationId + " pour le trajet #" + trajetId + " a été confirmée.";
            notificationStore.add(passagerId, msgPassenger, "/reservations");

            try {
                var trajet = trajetClient.getTrajet(trajetId);
                Long conducteurId = trajet.getConducteurId();
                String msgDriver = "Nouvelle réservation (#" + reservationId + ") pour votre trajet de " + trajet.getDepart() + " → " + trajet.getArrivee();
                notificationStore.add(conducteurId, msgDriver, "/trajets/" + trajetId);
            } catch (Exception e) {
                // Feign call may fail; ignore enrichment
            }
        } catch (Exception e) {
            // ignore
        }
    }

    public void handleTrajetEvent(Map<String, Object> payload) {
        Long trajetId = ((Number) payload.get("trajetId")).longValue();
        Long conducteurId = ((Number) payload.get("conducteurId")).longValue();

        System.out.println("🔔 Notification trajet reçue: " + payload);
        System.out.println("Notifier conducteur #" + conducteurId +
            " pour trajet #" + trajetId);

        try {
            var trajet = trajetClient.getTrajet(trajetId);
            String msg = "Votre trajet #" + trajetId + " (" + trajet.getDepart() + " → " + trajet.getArrivee() + ") a été modifié";
            notificationStore.add(conducteurId, msg, "/trajets/" + trajetId);
        } catch (Exception e) {
            notificationStore.add(conducteurId, "Votre trajet #" + trajetId + " a été modifié", "/trajets/" + trajetId);
        }
    }

    public void handleTrajetCancelledEvent(Map<String, Object> payload) {
        Long trajetId = ((Number) payload.get("trajetId")).longValue();
        Long conducteurId = ((Number) payload.get("conducteurId")).longValue();

        // Delete reservations for this trajet
        reservationClient.deleteReservationsByTrajetId(trajetId);

        System.out.println("🔔 Trajet annulé: " + payload);
        System.out.println("Supprimer réservations pour trajet #" + trajetId);
        try {
            // notify conducteur
            notificationStore.add(conducteurId, "Votre trajet #" + trajetId + " a été annulé.", "/trajets");

            // notify each passenger who had a reservation
            for (var r : reservationClient.getAll()) {
                if (r.getTrajetId() != null && r.getTrajetId().equals(trajetId)) {
                    notificationStore.add(r.getPassagerId(), "La réservation #" + r.getId() + " pour le trajet #" + trajetId + " a été annulée.", "/reservations");
                }
            }
        } catch (Exception e) {
            // ignore failures in notification delivery
        }
    }
}
