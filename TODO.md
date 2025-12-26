# TODO List for GoTogether Project Updates

## Backend Changes
- [ ] Remove RabbitMQ dependencies from trajetms, reservationms, notificationms pom.xml
- [ ] Add REST endpoints in notificationms for synchronous notifications (reservation created, trajet updated, trajet canceled, reservation canceled)
- [ ] Add Feign client in trajetms and reservationms for calling notificationms
- [ ] Update TrajetService: replace RabbitMQ with synchronous calls to notificationms for trajet updates and deletes
- [ ] Update ReservationService: replace RabbitMQ with synchronous calls to notificationms for reservation creates and confirms
- [ ] Add cancel reservation endpoint in ReservationController and Service (increase places, notify conductor)
- [ ] Add get reservations by passengerId endpoint in ReservationController and Service
- [ ] Add delete reservations by trajetId endpoint in ReservationController and Service (for canceling trip)
- [ ] Update TrajetController delete endpoint to notify passengers when canceling trip

## Frontend Changes
- [ ] Update ReservationService to call new cancel endpoint
- [ ] Update TrajetService to call new endpoints for my-trajets and cancel/modify
- [ ] Update my-reservations component to fetch user's reservations and allow canceling
- [ ] Update my-trajets component to fetch user's trips and allow canceling/modifying
- [ ] Update notifications component to fetch and display notifications
- [ ] Ensure auth guards are properly set on protected routes (create-trajet, my-trajets, my-reservations, notifications)
- [ ] Test authentication flow (register/login)
- [ ] Test trips listing and reservation flow
- [ ] Test create trip, my-trajets, my-reservations, notifications

## Testing
- [ ] Run integration tests to ensure all services communicate correctly
- [ ] Verify notifications are sent synchronously
- [ ] Check that canceling reservations and trips updates places and notifies correctly
