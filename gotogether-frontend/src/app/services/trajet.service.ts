import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trajet } from '../models/trajet';
import { isPlatformBrowser } from '@angular/common';

const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class TrajetService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Récupère le token depuis le localStorage si on est côté navigateur
  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (isPlatformBrowser(this.platformId)) {  // ✅ Sécurité SSR
      const token = localStorage.getItem('token'); 
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  getTrajets(): Observable<Trajet[]> {
    return this.http.get<Trajet[]>(`${BASE}/trajets`, { headers: this.getAuthHeaders() });
  }

  getTrajet(id: number): Observable<Trajet> {
    return this.http.get<Trajet>(`${BASE}/trajets/${id}`, { headers: this.getAuthHeaders() });
  }

  create(trajet: Partial<Trajet>): Observable<Trajet> {
    return this.http.post<Trajet>(`${BASE}/trajets`, trajet, { headers: this.getAuthHeaders() });
  }

  estimate(depart: string, arrivee: string): Observable<{distance: number; prix: number}> {
    return this.http.post<{distance:number;prix:number}>(`${BASE}/trajets/estimate`, {depart, arrivee}, { headers: this.getAuthHeaders() });
  }

  reserveTrajet(id: number, places: number): Observable<Trajet> {
    const params = new HttpParams().set('places', String(places));
    return this.http.put<Trajet>(`${BASE}/trajets/${id}/reserve`, null, { params, headers: this.getAuthHeaders() });
  }

  getMyTrajets(): Observable<Trajet[]> {
    return this.http.get<Trajet[]>(`${BASE}/trajets/my`, { headers: this.getAuthHeaders() });
  }

  deleteTrajet(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/trajets/${id}`, { headers: this.getAuthHeaders() });
  }
  
}
