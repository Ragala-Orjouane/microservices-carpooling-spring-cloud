package com.gotogether.notificationms.controller;

import com.gotogether.notificationms.model.Notification;
import com.gotogether.notificationms.repository.ReservationClient;
import com.gotogether.notificationms.repository.TrajetClient;
import com.gotogether.notificationms.repository.UtilisateurClient;
import com.gotogether.notificationms.services.NotificationStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationStore store;

    @Autowired
    private ReservationClient reservationClient;

    @Autowired
    private TrajetClient trajetClient;

    @Autowired
    private UtilisateurClient userClient;

    @GetMapping
    public List<Notification> getNotifications(@RequestParam Long userId) {
        return store.getForUser(userId);
    }



    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        store.markRead(id);
    }

    @PostMapping("/notify/reservation-created")
    public void notifyReservationCreated(@RequestBody Map<String, Object> payload) {
        Long trajetId = Long.valueOf(payload.get("trajetId").toString());
        Long passagerId = Long.valueOf(payload.get("passagerId").toString());

        // Récupération des détails du trajet via Feign
        var trajet = trajetClient.getTrajet(trajetId);
        Long conducteurId = trajet.getConducteurId();




        String msg = "Nouvelle réservation pour votre trajet: " + trajet.getDepart() + " -> " + trajet.getArrivee();

        store.add(conducteurId, msg, "/my-trajets");
    }


    @PostMapping("/notify/reservation-confirmed")
    public void notifyReservationConfirmed(@RequestBody Map<String, Object> payload) {
        Long reservationId = Long.valueOf(payload.get("reservationId").toString());
        Long passagerId = Long.valueOf(payload.get("passagerId").toString());
        Long trajetId = Long.valueOf(payload.get("trajetId").toString());
        // Notify passager
        store.add(passagerId, "Votre réservation a été confirmée.", "/reservations");
    }

    @PostMapping("/notify/reservation-canceled")
    public void notifyReservationCanceled(@RequestBody Map<String, Object> payload) {
        Long reservationId = Long.valueOf(payload.get("reservationId").toString());
        Long trajetId = Long.valueOf(payload.get("trajetId").toString());
        Long conducteurId = Long.valueOf(payload.get("conducteurId").toString());
        // Notify conducteur
        store.add(conducteurId, "Une réservation a été annulée pour votre trajet.", "/trajets/" + trajetId);
    }

    @PostMapping("/notify/trajet-canceled")
    public void notifyTrajetCanceled(@RequestBody Map<String, Object> payload) {
        Long trajetId = Long.valueOf(payload.get("trajetId").toString());
        Long conducteurId = Long.valueOf(payload.get("conducteurId").toString());
        // Get reservations for this trajet
        var reservations = reservationClient.getReservationsByTrajet(trajetId);
        for (var res : reservations) {
            store.add(res.getPassagerId(), "Le trajet a été annulé.", "/trajets");
        }
    }

    @PostMapping("/notify/trajet-updated")
    public void notifyTrajetUpdated(@RequestBody Map<String, Object> payload) {
        Long trajetId = Long.valueOf(payload.get("trajetId").toString());
        Long conducteurId = Long.valueOf(payload.get("conducteurId").toString());
        // Get reservations for this trajet
        var reservations = reservationClient.getReservationsByTrajet(trajetId);
        for (var res : reservations) {
            store.add(res.getPassagerId(), "Le trajet a été mis à jour.", "/trajets");
        }
    }

    @PutMapping("/read-all")
    public void markAllRead(@RequestParam Long userId) {
        store.markAllAsReadForUser(userId);
    }
    @DeleteMapping("/delete-multiple")
    public void deleteMultiple(@RequestBody List<Long> ids) {
        // On appelle une nouvelle méthode dans le store
        store.deleteMultiple(ids);
    }
}
