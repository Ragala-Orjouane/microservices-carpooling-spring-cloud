package com.gotogether.reservationms.controller;

import com.gotogether.reservationms.dto.ReservationDTO;
import com.gotogether.reservationms.dto.ReservationWithTrajetDTO;
import com.gotogether.reservationms.model.Reservation;
import com.gotogether.reservationms.services.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService service;

    @PostMapping
    public Reservation create(@RequestBody Map<String, Object> req, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Utilisateur non authentifié");

        Reservation r = new Reservation();
        r.setTrajetId(Long.valueOf((Integer) req.get("trajetId")));
        r.setPlacesReservees((Integer) req.get("placesReservees"));
        r.setPassagerId(userId);

        return service.createReservation(r);
    }

    @PutMapping("/{id}/confirm")
    public Reservation confirm(@PathVariable Long id, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        return service.confirmReservation(id, authHeader);
    }

    @PutMapping("/{id}/refuse")
    public void refuse(@PathVariable Long id, HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        service.refuseReservation(id, authHeader);
    }

    @DeleteMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id, HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        String authHeader = request.getHeader("Authorization");
        service.cancelReservation(id, userId, authHeader);
    }

    @GetMapping
    public Iterable<Reservation> all() {
        return service.getAll();
    }

    @GetMapping("/trajet/{trajetId}")
    public Iterable<ReservationDTO> getByTrajet(@PathVariable Long trajetId) {
        return service.getReservationsByTrajet(trajetId);
    }

    @GetMapping("/my")
    public List<ReservationWithTrajetDTO> getMy(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) throw new RuntimeException("Utilisateur non authentifié");

        return service.getReservationsWithTrajetByPassager(userId);
    }
}
