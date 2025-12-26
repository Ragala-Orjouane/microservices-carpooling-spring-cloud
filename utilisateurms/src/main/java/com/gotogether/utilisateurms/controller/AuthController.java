package com.gotogether.utilisateurms.controller;

import com.gotogether.utilisateurms.model.LoginRequest;
import com.gotogether.utilisateurms.model.User;
import com.gotogether.utilisateurms.security.JwtUtil;
import com.gotogether.utilisateurms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class AuthController {

    @Autowired
    private UserService service;
    @Autowired private JwtUtil jwt;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return service.createUser(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        User u = service.authenticate(req.getEmail(), req.getPassword());
        if (u == null) throw new RuntimeException("Invalid credentials");

        String token = jwt.generateToken(u.getId());

        return Map.of(
                "token", token,
                "user", u
        );
    }
}
