package com.gotogether.reservationms.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TrajetDTO {
    private Long id;
    private Long conducteurId;
    private Integer placesDisponibles;
    private String status;
    private Double prix;
    private Double distance;
    private String depart;
    private String arrivee;
    private LocalDateTime dateHeureDepart;
}

