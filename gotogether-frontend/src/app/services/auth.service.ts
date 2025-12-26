import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { User } from '../models/user';
import { isPlatformBrowser } from '@angular/common';

export interface LoginResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly BASE_URL = 'http://localhost:8080/api/users';

  // Observable pour le user
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.userSubject.next(JSON.parse(userJson));
      }
    }
  }
  getUserName(): string {
    // On récupère le fullName de l'utilisateur stocké, sinon une chaîne vide
    return this.userSubject.value?.fullName || 'Utilisateur';
  }
  login(credentials: { email: string; password: string }) {
    return this.http
      .post<LoginResponse>(`${this.BASE_URL}/login`, credentials)
      .pipe(
        tap(res => {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          this.userSubject.next(res.user);
        })
      );
  }

  register(data: { fullName: string; email: string; password: string }) {
    return this.http.post(`${this.BASE_URL}/register`, data);
  }

  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.userSubject.next(null);
  }

  getCurrentUserId(): number | null {
    return this.userSubject.value?.id ?? null;
  }
  /**
   * Enregistre l'heure actuelle comme étant le dernier moment 
   * où l'utilisateur a consulté ses notifications.
   */
  setLastNotificationView() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_notif_check', new Date().toISOString());
    }
  }

  /**
   * Récupère la date de la dernière consultation stockée.
   */
  getLastNotificationView(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_notif_check');
    }
    return null;
  }
}
