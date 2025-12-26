package com.gotogether.utilisateurms.controller;

import com.gotogether.utilisateurms.model.LoginRequest;
import com.gotogether.utilisateurms.model.User;
import com.gotogether.utilisateurms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService service;

    @GetMapping("/{email}")
    public User getByEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }

    @GetMapping("/id/{id}")
    public User getById(@PathVariable Long id) {
        return service.getById(id);
    }

}

