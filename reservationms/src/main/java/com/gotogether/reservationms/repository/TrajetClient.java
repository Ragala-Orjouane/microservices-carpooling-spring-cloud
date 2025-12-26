package com.gotogether.reservationms.repository;

import com.gotogether.reservationms.dto.TrajetDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "trajetms")
public interface TrajetClient {

    @PutMapping("/trajets/{id}/reserve")
    TrajetDTO reservePlace(
            @PathVariable Long id,
            @RequestParam int places,
            @RequestHeader("Authorization") String authHeader
    );

    @PutMapping("/trajets/{id}/cancel-reservation")
    TrajetDTO cancelReservation(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Integer> body,
            @RequestHeader("Authorization") String authHeader
    );


    @GetMapping("/trajets/{id}")
    TrajetDTO getTrajet(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    );
}
