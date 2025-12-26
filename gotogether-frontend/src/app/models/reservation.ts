export interface Reservation {
  id: number;
  trajetId: number;
  passagerId: number;
  passagerNom?: string;
  placesReservees: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUSED';
  createdAt: string;
}
