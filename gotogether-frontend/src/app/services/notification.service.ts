import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

const BASE = 'http://localhost:8080/api';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getNotifications(userId: number): Observable<Notification[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Notification[]>(`${BASE}/notifications`, { params });
  }

  markRead(id: number) {
    return this.http.put(`${BASE}/notifications/${id}/read`, {});
  }

  // Stocke l'heure de consultation dans le stockage local du navigateur
  setLastNotificationView() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('last_notif_check', new Date().toISOString());
    }
  }

  getLastNotificationView(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('last_notif_check');
    }
    return null;
  }
  // NotificationService.ts
  markAllAsRead(userId: number) {
    // On passe le userId pour que le backend sache quelles notifs traiter
    return this.http.put(`${BASE}/notifications/read-all?userId=${userId}`, {});
  }
  // Dans notification.service.ts
  deleteNotifications(ids: number[]): Observable<any> {
    // On utilise l'option 'body' car par défaut DELETE n'envoie pas de corps
    return this.http.delete(`${BASE}/notifications/delete-multiple`, { body: ids });
  }
}