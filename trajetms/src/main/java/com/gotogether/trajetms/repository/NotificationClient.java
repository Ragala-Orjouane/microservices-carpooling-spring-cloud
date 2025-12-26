package com.gotogether.trajetms.repository;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notificationms")
public interface NotificationClient {

    @PostMapping("/notifications/notify/trajet-updated")
    void notifyTrajetUpdated(@RequestBody Map<String, Object> payload);

    @PostMapping("/notifications/notify/trajet-canceled")
    void notifyTrajetCanceled(@RequestBody Map<String, Object> payload);
}
