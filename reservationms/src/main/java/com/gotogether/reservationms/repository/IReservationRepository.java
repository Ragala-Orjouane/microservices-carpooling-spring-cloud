package com.gotogether.reservationms.repository;

import com.gotogether.reservationms.model.Reservation;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface IReservationRepository extends CrudRepository<Reservation, Long> {
    List<Reservation> findByTrajetId(Long trajetId);
    List<Reservation> findByPassagerId(Long passagerId);

    List<Reservation> getReservationsById(Long id);
}
