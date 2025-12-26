package com.gotogether.reservationms.dto;

import java.time.LocalDateTime;

public class ReservationWithTrajetDTO {

    private Long id;
    private int placesReservees;
    private String status;

    private Long trajetId;
    private String depart;
    private String arrivee;
    private LocalDateTime dateHeureDepart;
    private double prix;

    private String passagerNom;
    private String conducteurNom;

    // Constructeur
    public ReservationWithTrajetDTO(Long id, int placesReservees, String status,
                                    Long trajetId, String depart, String arrivee,
                                    LocalDateTime dateHeureDepart, double prix,
                                    String passagerNom, String conducteurNom) {
        this.id = id;
        this.placesReservees = placesReservees;
        this.status = status;
        this.trajetId = trajetId;
        this.depart = depart;
        this.arrivee = arrivee;
        this.dateHeureDepart = dateHeureDepart;
        this.prix = prix;
        this.passagerNom = passagerNom;
        this.conducteurNom = conducteurNom;
    }

    // Getters
    public Long getId() { return id; }
    public int getPlacesReservees() { return placesReservees; }
    public String getStatus() { return status; }
    public Long getTrajetId() { return trajetId; }
    public String getDepart() { return depart; }
    public String getArrivee() { return arrivee; }
    public LocalDateTime getDateHeureDepart() { return dateHeureDepart; }
    public double getPrix() { return prix; }
    public String getPassagerNom() { return passagerNom; }
    public String getConducteurNom() { return conducteurNom; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setPlacesReservees(int placesReservees) { this.placesReservees = placesReservees; }
    public void setStatus(String status) { this.status = status; }
    public void setTrajetId(Long trajetId) { this.trajetId = trajetId; }
    public void setDepart(String depart) { this.depart = depart; }
    public void setArrivee(String arrivee) { this.arrivee = arrivee; }
    public void setDateHeureDepart(LocalDateTime dateHeureDepart) { this.dateHeureDepart = dateHeureDepart; }
    public void setPrix(double prix) { this.prix = prix; }
    public void setPassagerNom(String passagerNom) { this.passagerNom = passagerNom; }
    public void setConducteurNom(String conducteurNom) { this.conducteurNom = conducteurNom; }
}
