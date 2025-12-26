export interface Trajet {
  id?: number;
  conducteurId?: number;
  depart: string;
  arrivee: string;
  prix?: number;
  dateHeureDepart?: string; // ISO string
  placesDisponibles?: number;
  nombrePassagers?: number;
  distance?: number;
  status?: string;
}
