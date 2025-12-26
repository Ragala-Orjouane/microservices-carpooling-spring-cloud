import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { NotificationService, Notification } from './services/notification.service';
import { interval, Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="topbar">
      <div class="container">
        <div class="brand-group" routerLink="/">
          <span class="logo-icon">🚗</span>
          <h1 class="brand">GoTogether</h1>
        </div>
        
        <nav class="nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Accueil</a>
          <a routerLink="/trajets" routerLinkActive="active">Trajets</a>
          
          <ng-container *ngIf="isLoggedIn">
            <a routerLink="/my-trajets" routerLinkActive="active">Mes trajets</a>
            <a routerLink="/my-reservations" routerLinkActive="active">Réservations</a>

            <div class="notifications-dropdown">
              <button class="notifications-btn" (click)="toggleNotificationsDropdown()">
                <span class="bell-icon">🔔</span>
                <span class="count" *ngIf="notificationsCount > 0">{{ notificationsCount }}</span>
              </button>

              <div class="dropdown-menu" *ngIf="showNotificationsDropdown">
                <div class="dropdown-header">Dernières Notifications</div>
                <div class="scroll-area">
                  <div *ngIf="notifications.length === 0" class="empty-state">Aucune notification</div>
                  
                  <div *ngFor="let notif of notifications.slice(0,8)" 
                       class="notification-item" 
                       [class.unread]="!notif.read" 
                       (click)="markAsRead(notif)">
                    <p class="notif-msg">{{ notif.message }}</p>
                    <small class="notif-date">{{ notif.createdAt | date:'short' }}</small>
                  </div>
                </div>
                <a routerLink="/notifications" class="view-all" (click)="showNotificationsDropdown = false">
                  Voir tout ({{ notifications.length }})
                </a>
              </div>
            </div>
          </ng-container>

          <div class="auth-actions">
            <a routerLink="/login" *ngIf="!isLoggedIn" class="login-link">Se connecter</a>
            <a routerLink="/register" *ngIf="!isLoggedIn" class="btn-signup">S'inscrire</a>
            
            <div class="user-info" *ngIf="isLoggedIn">
               <span class="user-name">{{ user?.fullName }}</span>
               <button (click)="logout()" class="logout-btn">Quitter</button>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <div class="container">
        <p>© 2025 GoTogether — Le covoiturage durable au Maroc</p>
      </div>
    </footer>

    <style>
      :host { 
        --primary: #00aaff; --dark: #003d3d; 
        display: flex; flex-direction: column; min-height: 100vh; 
      }
      .app-main { flex: 1; display: flex; flex-direction: column; }
      .topbar { background: white; padding: 0.8rem 0; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 1000; }
      .container { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; width: 100%; }
      .brand-group { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; text-decoration: none; }
      .brand { margin: 0; font-size: 1.3rem; font-weight: 800; color: var(--dark); }
      .nav { display: flex; align-items: center; gap: 1.2rem; }
      .nav a { color: #64748b; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
      .nav a.active { color: var(--primary); }
      
      .notifications-dropdown { position: relative; }
      .notifications-btn { background: #f1f5f9; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; position: relative; transition: 0.2s; }
      .notifications-btn:hover { background: #e2e8f0; }
      .count { position: absolute; top: -2px; right: -2px; background: #ef4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; justify-content: center; border: 2px solid white; }
      
      .dropdown-menu { position: absolute; top: 50px; right: 0; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); width: 320px; border: 1px solid #e2e8f0; overflow: hidden; animation: slideIn 0.2s ease-out; }
      .dropdown-header { padding: 1rem; font-weight: 700; border-bottom: 1px solid #f1f5f9; background: #fafafa; color: var(--dark); }
      .scroll-area { max-height: 350px; overflow-y: auto; }
      .notification-item { padding: 1rem; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: 0.2s; }
      .notification-item:hover { background: #f8fafc; }
      .notification-item.unread { background: #f0f9ff; border-left: 4px solid var(--primary); }
      .notif-msg { margin: 0; font-size: 0.9rem; color: #1e293b; line-height: 1.4; }
      .notif-date { color: #94a3b8; font-size: 0.75rem; }
      .empty-state { padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }
      .view-all { display: block; padding: 0.9rem; text-align: center; color: var(--primary); font-weight: 700; text-decoration: none; border-top: 1px solid #f1f5f9; background: white; }

      .auth-actions { display: flex; align-items: center; gap: 1rem; padding-left: 1rem; border-left: 1px solid #e2e8f0; }
      .user-name { font-weight: 700; color: var(--dark); font-size: 0.9rem; }
      .logout-btn { background: #fee2e2; border: none; color: #ef4444; padding: 0.4rem 0.8rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s; }
      .logout-btn:hover { background: #fecaca; }
      .footer { padding: 2rem 0; text-align: center; background: #f8fafc; border-top: 1px solid #e2e8f0; margin-top: auto; }

      @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
  `,
})
export class App implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  notificationsCount = 0;
  showNotificationsDropdown = false;
  isLoggedIn = false;
  user: any = null;
  private pollSub?: Subscription;

  constructor(
    public authSrv: AuthService,
    private router: Router,
    private noteSrv: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.authSrv.user$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;

      if (this.isLoggedIn && user?.id) {
        this.loadNotifications(user.id);
        if (isPlatformBrowser(this.platformId)) {
          this.startPolling(user.id);
        }
      } else {
        this.stopPolling();
      }
    });
  }

  private startPolling(userId: number) {
    this.pollSub?.unsubscribe();
    this.loadNotifications(userId);
    this.pollSub = interval(10000).subscribe(() => this.loadNotifications(userId));
  }

  private loadNotifications(userId: number) {
    this.noteSrv.getNotifications(userId).subscribe({
      next: (n) => {
        this.notifications = n ?? [];
        // On vérifie 'read' OU 'isRead' selon ce que renvoie votre API
        this.notificationsCount = this.notifications.filter(notif => 
          (notif.read === false) || ((notif as any).isRead === false)
        ).length;
      }
    });
  }

  toggleNotificationsDropdown() {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    
    // ACTION : Si on ouvre le menu et qu'il y a des nouvelles notifications
    if (this.showNotificationsDropdown && this.notificationsCount > 0) {
      const userId = this.user?.id;
      if (userId) {
        // 1. UI: Le badge disparaît immédiatement
        this.notificationsCount = 0;
        
        // 2. UI: On marque tout comme lu localement pour le style CSS
        this.notifications.forEach(n => n.read = true);

        // 3. API: On informe le serveur pour que ce soit permanent en base de données
        this.noteSrv.markAllAsRead(userId).subscribe({
          error: (err) => console.error("Erreur marquage global", err)
        });
      }
    }
  }

  markAsRead(notif: Notification) {
    if (notif.read) {
      this.handleNotifClick(notif);
      return;
    }

    // Marquage individuel (si l'utilisateur clique sur une notif précise sans passer par le toggle)
    this.noteSrv.markRead(notif.id).subscribe(() => {
      notif.read = true;
      this.notificationsCount = this.notifications.filter(n => !n.read).length;
      this.handleNotifClick(notif);
    });
  }

  private handleNotifClick(notif: Notification) {
    this.showNotificationsDropdown = false;
    if (notif.link) {
      this.router.navigateByUrl(notif.link);
    }
  }

  logout() {
    this.authSrv.logout();
    this.stopPolling();
    this.router.navigate(['/login']);
  }

  private stopPolling() {
    this.pollSub?.unsubscribe();
    this.notifications = [];
    this.notificationsCount = 0;
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}