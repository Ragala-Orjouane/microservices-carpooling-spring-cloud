package com.gotogether.trajetms.repository;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "reservationms")
public interface ReservationClient {

    @DeleteMapping("/reservations/trajet/{trajetId}")
    void deleteReservationsByTrajet(@PathVariable Long trajetId);
}
