package com.gotogether.notificationms.repository;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "reservationms")
public interface ReservationClient {

    @DeleteMapping("/reservations/trajet/{trajetId}")
    void deleteReservationsByTrajetId(@PathVariable Long trajetId);

    @GetMapping("/reservations")
    Iterable<com.gotogether.notificationms.dto.ReservationDTO> getAll();

    @GetMapping("/reservations/trajet/{trajetId}")
    Iterable<com.gotogether.notificationms.dto.ReservationDTO> getReservationsByTrajet(@PathVariable Long trajetId);
}
