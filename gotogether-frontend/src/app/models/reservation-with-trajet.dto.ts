export interface ReservationWithTrajetDTO {
  id: number;
  placesReservees: number;
  status: string;

  trajetId: number;
  depart: string;
  arrivee: string;
  dateHeureDepart: string; // ou Date
  prix: number;

  passagerNom: string;
  conducteurNom: string;
}
