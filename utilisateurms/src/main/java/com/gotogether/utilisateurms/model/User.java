package com.gotogether.utilisateurms.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true)
    private String email;
    private String fullName;
    private String password;
    private String role = "USER";
    private boolean fromGoogle = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}