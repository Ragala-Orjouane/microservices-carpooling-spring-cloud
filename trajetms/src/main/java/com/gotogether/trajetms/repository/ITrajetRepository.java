package com.gotogether.trajetms.repository;


import com.gotogether.trajetms.model.Trajet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ITrajetRepository extends JpaRepository<Trajet,Long> {

    List<Trajet> findByConducteurId(Long conducteurId);

    @Query("SELECT t FROM Trajet t WHERE t.dateHeureDepart > :now AND t.status = 'AVAILABLE'")
    List<Trajet> findAvailableTrajets(@Param("now") LocalDateTime now);
}
