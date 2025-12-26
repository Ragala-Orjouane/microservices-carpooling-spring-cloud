package com.gotogether.trajetms.services;

import com.gotogether.trajetms.model.Trajet;
import com.gotogether.trajetms.repository.ITrajetRepository;
import com.gotogether.trajetms.repository.NotificationClient;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class TrajetService {

    @Autowired
    private GeocodingService geoService;

    @Autowired
    private OsrmService osrmService;

    @Autowired
    private ITrajetRepository trajetRepo;

    @Autowired
    private NotificationClient notificationClient;

    private static final double TARIF_PAR_KM = 5.0;

    private static final double TARIF_PAR_KM_PAR_PERSONNE = 0.5;
    private static final double DISTANCE_DEFAUT = 100.0; // En cas de panne internet

    @Transactional
    public Trajet saveTrajet(Trajet trajet) {
        if (trajet.getId() == null) {
            double distanceKm;
            try {
                double[] dep = geoService.getCoordinates(trajet.getDepart());
                double[] arr = geoService.getCoordinates(trajet.getArrivee());
                distanceKm = osrmService.getDistanceInKm(dep[0], dep[1], arr[0], arr[1]);
            } catch (Exception e) {
                System.err.println("Calcul impossible (Réseau), utilisation distance défaut: " + e.getMessage());
                distanceKm = DISTANCE_DEFAUT;
            }
            double prix = distanceKm * TARIF_PAR_KM_PAR_PERSONNE;

            trajet.setDistance(distanceKm);
            trajet.setPrix(prix);

            if (trajet.getNombrePassagers() == null) {
                trajet.setNombrePassagers(0);
            }
        }
        LocalDateTime now = LocalDateTime.now();
        if (trajet.getDateHeureDepart() != null && trajet.getDateHeureDepart().isBefore(now)) {
            trajet.setStatus("EXPIRED");
        } else if (trajet.getPlacesDisponibles() != null && trajet.getPlacesDisponibles() <= 0) {
            trajet.setStatus("FULL");
        } else {
            trajet.setStatus("AVAILABLE");
        }
        return trajetRepo.save(trajet);
    }

    public Map<String, Object> estimate(String depart, String arrivee) {
        double distanceKm;
        try {
            double[] dep = geoService.getCoordinates(depart);
            double[] arr = geoService.getCoordinates(arrivee);
            distanceKm = osrmService.getDistanceInKm(dep[0], dep[1], arr[0], arr[1]);
        } catch (Exception e) {
            distanceKm = DISTANCE_DEFAUT;
        }

        double prix = distanceKm * TARIF_PAR_KM_PAR_PERSONNE;
        return Map.of("distance", distanceKm, "prix", prix);
    }

    public Optional<Trajet> getTrajetById(final Long id){return trajetRepo.findById(id);}
    public Iterable<Trajet> getTrajets() {return trajetRepo.findAll();}

    public List<Trajet> getTrajetsByConducteurId(Long conducteurId) {
        return trajetRepo.findByConducteurId(conducteurId);
    }

    public List<Trajet> getAvailableTrajets() {
        return trajetRepo.findAvailableTrajets(java.time.LocalDateTime.now());
    }

    public double[] getCoordinates(String address) {
        return geoService.getCoordinates(address);
    }

    public double getDistanceInKm(double lat1, double lon1, double lat2, double lon2) {
        return osrmService.getDistanceInKm(lat1, lon1, lat2, lon2);
    }

    public void deleteTrajetById(final Long id){
        Optional<Trajet> trajetOpt = trajetRepo.findById(id);
        if(trajetOpt.isPresent()){
            Trajet trajet = trajetOpt.get();
            // Send notification to cancel trajet
            notificationClient.notifyTrajetCanceled(Map.of(
                "trajetId", trajet.getId(),
                "conducteurId", trajet.getConducteurId()
            ));
        }
        trajetRepo.deleteById(id);
    }

    @Scheduled(fixedDelay = 60000)
    public void expireOldTrajets() {
        LocalDateTime now = LocalDateTime.now();
        List<Trajet> all = trajetRepo.findAll();
        for (Trajet t : all) {
            if (t.getDateHeureDepart() != null && t.getDateHeureDepart().isBefore(now) && !"EXPIRED".equals(t.getStatus())) {
                t.setStatus("EXPIRED");
                trajetRepo.save(t);
            }
        }
    }

    public void notifyTrajetUpdated(Trajet trajet) {
        notificationClient.notifyTrajetUpdated(Map.of(
            "trajetId", trajet.getId(),
            "conducteurId", trajet.getConducteurId()
        ));
    }

    public void notifyTrajetCanceled(Trajet trajet) {
        notificationClient.notifyTrajetCanceled(Map.of(
            "trajetId", trajet.getId(),
            "conducteurId", trajet.getConducteurId()
        ));
    }

}
