# TODO: Fix Issues in GoTogether Application

## Information Gathered
- 400 Bad Request errors for /api/trajets/estimate and /api/trajets/my endpoints (endpoints missing in backend)
- passager_id not saved in reservations (missing in frontend payload)
- conducteur_id not set in trajets (missing in frontend payload)
- trajet status not set on creation (should default to "AVAILABLE")
- "my-trajets" page empty because no conducteur_id to filter by
- Trajets should only show if status != "FULL" and placesDisponibles > 0

## Plan
### Backend Changes
- trajetms: Add /trajets/estimate GET endpoint in TrajetController
- trajetms: Add /trajets/my GET endpoint in TrajetController (filter by conducteurId)
- trajetms: Update TrajetService.saveTrajet to set status="AVAILABLE" and nombrePassagers=placesDisponibles
- trajetms: Update ITrajetRepository to extend JpaRepository and add findByConducteurId method
- trajetms: Make geoService and osrmService methods public in TrajetService for estimate endpoint
- reservationms: Update ReservationService.createReservation to set passagerId from request (but actually, it's set in frontend now)

### Frontend Changes
- trajet.service.ts: Update getMyTrajets to pass userId as param
- create-trajet.component.ts: Include conducteurId in payload from localStorage user
- trajets-list.component.ts: Include passagerId in reservation payload from localStorage user
- trajets-list.component.ts: Filter trajets to show only available (status != "FULL" and placesDisponibles > 0)

## Dependent Files to be edited
- trajetms/src/main/java/com/gotogether/trajetms/controller/TrajetController.java
- trajetms/src/main/java/com/gotogether/trajetms/services/TrajetService.java
- trajetms/src/main/java/com/gotogether/trajetms/repository/ITrajetRepository.java
- gotogether-frontend/src/app/services/trajet.service.ts
- gotogether-frontend/src/app/components/create-trajet.component.ts
- gotogether-frontend/src/app/components/trajets-list.component.ts

## Followup steps
- Test the endpoints with curl or frontend
- Verify reservations save passager_id
- Verify trajets save conducteur_id and status
- Verify my-trajets shows user's trajets
- Verify trajets list filters available ones
