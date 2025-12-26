package com.gotogether.reservationms.dto;

public class ReservationDTO {

    private Long id;
    private int placesReservees;
    private String status;
    private Long passagerId;
    private String passagerNom; // 🔹 le nom du passager

    private Long trajetId;

    // Constructeurs
    public ReservationDTO() {}

    public ReservationDTO(Long id, int placesReservees, String status, Long passagerId, String passagerNom, Long trajetId) {
        this.id = id;
        this.placesReservees = placesReservees;
        this.status = status;
        this.passagerId = passagerId;
        this.passagerNom = passagerNom;
        this.trajetId = trajetId;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getPlacesReservees() { return placesReservees; }
    public void setPlacesReservees(int placesReservees) { this.placesReservees = placesReservees; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getPassagerId() { return passagerId; }
    public void setPassagerId(Long passagerId) { this.passagerId = passagerId; }

    public String getPassagerNom() { return passagerNom; }
    public void setPassagerNom(String passagerNom) { this.passagerNom = passagerNom; }

    public Long getTrajetId() { return trajetId; }
    public void setTrajetId(Long trajetId) { this.trajetId = trajetId; }
}
