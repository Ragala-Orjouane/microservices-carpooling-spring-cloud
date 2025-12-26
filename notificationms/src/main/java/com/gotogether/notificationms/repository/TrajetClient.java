package com.gotogether.notificationms.repository;

import com.gotogether.notificationms.dto.TrajetDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "trajetms")
public interface TrajetClient {
    @GetMapping("/trajets/{id}")
    TrajetDTO getTrajet(@PathVariable Long id);
}
