package com.gotogether.reservationms.repository;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notificationms")
public interface NotificationClient {

    @PostMapping("/notifications/notify/reservation-created")
    void notifyReservationCreated(@RequestBody Map<String, Object> payload);

    @PostMapping("/notifications/notify/reservation-confirmed")
    void notifyReservationConfirmed(@RequestBody Map<String, Object> payload);

    @PostMapping("/notifications/notify/reservation-canceled")
    void notifyReservationCanceled(@RequestBody Map<String, Object> payload);

    @PostMapping("/notifications/reservation-refused")
    void notifyReservationRefused(Map<String, Object> payload);
}
