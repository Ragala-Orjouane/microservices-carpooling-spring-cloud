import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationWithTrajetDTO } from '../models/reservation-with-trajet.dto';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private api = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Utilisateur non connecté');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }


  create(data: { trajetId: number; placesReservees: number }): Observable<any> {
    return this.http.post(`${this.api}`, data, { headers: this.getAuthHeaders() });
  }

  confirm(id: number): Observable<any> {
    return this.http.put(`${this.api}/${id}/confirm`, {}, { headers: this.getAuthHeaders() });
  }

  refuse(id: number): Observable<any> {
    return this.http.put(`${this.api}/${id}/refuse`, {}, { headers: this.getAuthHeaders() });
  }

  cancel(id: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.delete<void>(`${this.api}/${id}/cancel`, { headers });
  }

  byPassager(): Observable<ReservationWithTrajetDTO[]> {
    const token = localStorage.getItem('token'); // ou sessionStorage selon ton app
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ReservationWithTrajetDTO[]>(`${this.api}/my`, { headers });
  }

  byTrajet(trajetId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/trajet/${trajetId}`, { headers: this.getAuthHeaders() });
  }


}
