package com.gotogether.trajetms.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Trajet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long conducteurId;
    private String depart;
    private String arrivee;
    private Double prix;
    private LocalDateTime dateHeureDepart;
    private Integer placesDisponibles;
    private Integer nombrePassagers;
    private Double distance;
    private String status;
}
