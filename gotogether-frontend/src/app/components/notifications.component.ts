import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { NotificationService, Notification } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-notifications',
  template: `
    <section class="page">
      <div class="container-inner">
        <div class="header-row">
          <h1 class="title">Notifications</h1>
          <button *ngIf="selectedIds.size > 0" class="delete-btn" (click)="deleteSelected()">
            Supprimer ({{ selectedIds.size }})
          </button>
        </div>
        
        <div *ngIf="notifications.length === 0" class="empty-state">
          <p>Aucune notification pour le moment.</p>
        </div>

        <div class="notif-list">
          <article *ngFor="let n of getPaginatedNotifications()" 
                   class="notif-card"
                   [class.selected]="selectedIds.has(n.id)"
                   [style.border-left-color]="n.read ? '#e2e8f0' : '#00aaff'">
            <div class="card-content">
              <div class="checkbox-area">
                <input type="checkbox" 
                       [checked]="selectedIds.has(n.id)" 
                       (change)="toggleSelection(n.id)">
              </div>
              <div class="info">
                <p class="message">{{ n.message }}</p>
                <small class="date">📅 {{ n.createdAt | date:'EEEE d MMMM' }} à {{ n.createdAt | date:'HH:mm' }}</small>
              </div>
              <span *ngIf="!n.read" class="new-badge">NOUVEAU</span>
            </div>
          </article>
        </div>

        <div class="pagination-container" *ngIf="getTotalPages() > 1">
          <button class="pag-btn" (click)="prevPage()" [disabled]="currentPage === 1">Précédent</button>
          <div class="pag-info">Page <span>{{ currentPage }}</span> sur {{ getTotalPages() }}</div>
          <button class="pag-btn" (click)="nextPage()" [disabled]="currentPage === getTotalPages()">Suivant</button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 3rem; background: #f8fafc; min-height: 100vh; font-family: sans-serif; }
    .container-inner { max-width: 800px; margin: 0 auto; }
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .title { font-size: 2.2rem; color: #003d3d; font-weight: 800; margin: 0; }
    
    .delete-btn { background: #ef4444; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: bold; cursor: pointer; transition: 0.3s; animation: fadeIn 0.3s; }
    .delete-btn:hover { background: #dc2626; }

    .notif-list { display: flex; flex-direction: column; gap: 1rem; }
    .notif-card { background: white; padding: 1.5rem; border-radius: 15px; border-left: 5px solid; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.2s; }
    .notif-card.selected { background: #fff5f5; border-color: #fca5a5 !important; }

    .card-content { display: flex; align-items: flex-start; gap: 1rem; }
    .checkbox-area { padding-top: 4px; }
    .checkbox-area input { width: 18px; height: 18px; cursor: pointer; }
    
    .info { flex: 1; }
    .message { margin: 0; font-weight: 600; color: #1e293b; font-size: 1.05rem; }
    .date { color: #94a3b8; display: block; margin-top: 0.5rem; }

    .new-badge { background: #00aaff; color: white; padding: 3px 10px; border-radius: 10px; font-size: 0.7rem; font-weight: bold; }
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1.2rem; margin-top: 3rem; }
    .pag-btn { background: white; color: #00aaff; border: 2px solid #00aaff; padding: 0.6rem 1.4rem; border-radius: 12px; cursor: pointer; font-weight: bold; }
    .pag-btn:disabled { border-color: #cbd5e1; color: #cbd5e1; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 4rem; background: white; border-radius: 20px; color: #64748b; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  selectedIds: Set<number> = new Set(); // Stocke les IDs cochés
  
  currentPage = 1;
  pageSize = 3; 
  private sub!: Subscription;

  constructor(
    private srv: NotificationService,
    private auth: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void { if (this.sub) this.sub.unsubscribe(); }

  load(): void {
    const userId = this.auth.getCurrentUserId();
    if (userId) {
      this.srv.getNotifications(userId).subscribe({
        next: (res) => {
          this.notifications = res ?? [];
          this.markAllAsRead();
          this.cd.detectChanges();
        }
      });
    }
  }

  toggleSelection(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  deleteSelected() {
    if (confirm(`Supprimer ${this.selectedIds.size} notification(s) ?`)) {
      const idsToDelete = Array.from(this.selectedIds);
      this.srv.deleteNotifications(idsToDelete).subscribe({
        next: () => {
          // Filtrer localement pour mettre à jour l'UI sans recharger tout
          this.notifications = this.notifications.filter(n => !this.selectedIds.has(n.id));
          this.selectedIds.clear();
          // Ajuster la page courante si elle devient vide
          if (this.getPaginatedNotifications().length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }
          this.cd.detectChanges();
        },
        error: (err) => alert("Erreur lors de la suppression")
      });
    }
  }

  // --- Logique Pagination (Inchangée) ---
  getPaginatedNotifications() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.notifications.slice(start, start + this.pageSize);
  }
  getTotalPages(): number { return Math.ceil(this.notifications.length / this.pageSize); }
  nextPage(): void { if (this.currentPage < this.getTotalPages()) { this.currentPage++; this.cd.detectChanges(); } }
  prevPage(): void { if (this.currentPage > 1) { this.currentPage--; this.cd.detectChanges(); } }

  markAllAsRead() {
    this.notifications.forEach(n => {
      if (!n.read) {
        this.srv.markRead(n.id).subscribe(() => { n.read = true; this.cd.detectChanges(); });
      }
    });
  }
}