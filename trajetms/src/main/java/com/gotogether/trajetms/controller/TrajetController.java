package com.gotogether.trajetms.controller;

import com.gotogether.trajetms.model.Trajet;
import com.gotogether.trajetms.services.TrajetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/trajets")
public class TrajetController {

    @Autowired
    private TrajetService trajetService;

    // GET publics
    @GetMapping
    public List<Trajet> getTrajets() {
        return trajetService.getAvailableTrajets();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trajet> getTrajet(@PathVariable Long id) {
        Optional<Trajet> trajetOpt = trajetService.getTrajetById(id);
        return trajetOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // GET protégés
    @GetMapping("/my")
    public List<Trajet> getMyTrajets(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Utilisateur non authentifié");
        return trajetService.getTrajetsByConducteurId(userId);
    }

    // POST création
    @PostMapping
    public Trajet saveTrajet(@RequestBody Map<String, Object> req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Utilisateur non authentifié");

        Trajet trajet = new Trajet();
        trajet.setDepart((String) req.get("depart"));
        trajet.setArrivee((String) req.get("arrivee"));
        trajet.setDateHeureDepart(LocalDateTime.parse((String) req.get("dateHeureDepart")));

        Object placesObj = req.get("placesDisponibles");
        trajet.setPlacesDisponibles((placesObj instanceof Number) ? ((Number) placesObj).intValue() : 1);

        trajet.setConducteurId(userId);
        return trajetService.saveTrajet(trajet);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrajet(@PathVariable Long id) {
        trajetService.deleteTrajetById(id);
        return ResponseEntity.noContent().build();
    }

    // POST estimation
    @PostMapping("/estimate")
    public Map<String, Object> estimate(@RequestBody Map<String, String> req) {
        return trajetService.estimate(req.get("depart"), req.get("arrivee"));
    }

    // PUT mise à jour
    @PutMapping("/{id}")
    public Trajet updateTrajet(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        Optional<Trajet> existingTrajetOpt = trajetService.getTrajetById(id);
        if (existingTrajetOpt.isEmpty()) throw new RuntimeException("Trajet introuvable");

        Trajet existingTrajet = existingTrajetOpt.get();
        existingTrajet.setDepart((String) req.get("depart"));
        existingTrajet.setArrivee((String) req.get("arrivee"));
        existingTrajet.setDateHeureDepart(LocalDateTime.parse((String) req.get("dateHeureDepart")));

        Object placesObj = req.get("placesDisponibles");
        existingTrajet.setPlacesDisponibles(
                (placesObj instanceof Number) ? ((Number) placesObj).intValue() : existingTrajet.getPlacesDisponibles()
        );

        Trajet saved = trajetService.saveTrajet(existingTrajet);
        trajetService.notifyTrajetUpdated(saved);
        return saved;
    }

    // PUT réservation
    @PutMapping("/{id}/reserve")
    public Trajet reservePlace(@PathVariable Long id, @RequestParam int places) {
        Optional<Trajet> opt = trajetService.getTrajetById(id);
        if (opt.isEmpty()) throw new RuntimeException("Trajet introuvable");

        Trajet t = opt.get();
        if (t.getPlacesDisponibles() < places) throw new RuntimeException("Pas assez de places disponibles");

        t.setPlacesDisponibles(t.getPlacesDisponibles() - places);
        return trajetService.saveTrajet(t);
    }

    // PUT annulation réservation
    @PutMapping("/{id}/cancel-reservation")
    public Trajet cancelReservation(@PathVariable Long id,
                                    @RequestBody(required = false) Map<String, Integer> body) {
        Optional<Trajet> opt = trajetService.getTrajetById(id);
        if (opt.isEmpty()) throw new RuntimeException("Trajet introuvable");
        Trajet t = opt.get();

        int places = body.get("places");
        t.setPlacesDisponibles(t.getPlacesDisponibles() + places);
        return trajetService.saveTrajet(t);
    }

}
