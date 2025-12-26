package com.gotogether.notificationms.repository;

import com.gotogether.notificationms.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "utilisateurms")
public interface UtilisateurClient {

    @GetMapping("/users/{id}")
    UserDTO getUserById(@PathVariable Long id);
}


