import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';

import { Trajet } from '../models/trajet';
import { Reservation } from '../models/reservation';
import { TrajetService } from '../services/trajet.service';
import { ReservationService } from '../services/reservation.service';

@Component({
  standalone: true,
  selector: 'app-my-trajets',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <section class="page">
      <div class="list-header">
        <h1 class="title">Mes trajets publiés</h1>
        <a routerLink="/trajets/create" class="btn-create">
          <span>+</span> Créer un trajet
        </a>
      </div>

      <p *ngIf="trajets.length === 0" class="empty">Vous n'avez pas encore publié de trajets.</p>

      <div class="trajets-grid">
        <article *ngFor="let t of paginatedTrajets()" class="trajet-card">
          <div class="card-content">
            <div class="route-info">
              <div class="cities">
                <span class="city">{{ t.depart }}</span>
                <span class="arrow">→</span>
                <span class="city">{{ t.arrivee }}</span>
              </div>
              <div class="details-row">
                <span class="detail-item">📅 {{ t.dateHeureDepart | date:'EEEE d MMMM' }}</span>
                <span class="detail-item">🕒 {{ t.dateHeureDepart | date:'HH:mm' }}</span>
                <span class="detail-item">💺 {{ t.placesDisponibles ?? 0 }} places libres</span>
              </div>
            </div>

            <div class="price-action">
              <div class="price-tag">{{ t.prix | number:'1.2-2' }} <span>DH</span></div>
              <button class="btn-manage" (click)="openReservations(t)">
                Voir les réservations
              </button>
            </div>
          </div>
        </article>
      </div>

      <div class="pagination-container" *ngIf="totalPages() > 1">
        <button class="pag-btn" (click)="prevPage()" [disabled]="currentPage === 1">Précédent</button>
        <div class="pag-info">Page <span>{{ currentPage }}</span> sur {{ totalPages() }}</div>
        <button class="pag-btn" (click)="nextPage()" [disabled]="currentPage === totalPages()">Suivant</button>
      </div>

      <div class="overlay" *ngIf="selectedTrajet" (click)="close()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Réservations reçues</h3>
            <p class="modal-subtitle">{{ selectedTrajet.depart }} → {{ selectedTrajet.arrivee }}</p>
          </div>

          <div *ngIf="reservations.length > 0" class="reservation-list">
            <div *ngFor="let r of reservations" class="res-item">
              <div class="res-user">
                <div class="avatar">{{ (r.passagerNom || 'P').charAt(0) }}</div>
                <div class="res-info">
                  <p class="res-name">{{ r.passagerNom || 'Passager' }}</p>
                  <p class="res-meta">{{ r.placesReservees }} place(s) réservée(s)</p>
                </div>
              </div>
              
              <div class="res-status-group">
                <span class="badge" [ngClass]="r.status.toLowerCase()">
                  {{ r.status === 'PENDING' ? 'En attente' : r.status === 'CONFIRMED' ? 'Confirmé' : 'Refusé' }}
                </span>
                
                <div class="action-buttons" *ngIf="r.status === 'PENDING'">
                  <button class="btn-confirm-res" (click)="confirm(r.id)">Confirmer</button>
                  <button class="btn-refuse" (click)="refuse(r.id)">Refuser</button>
                </div>
              </div>
            </div>
          </div>

          <p *ngIf="reservations.length === 0" class="empty-modal">Aucune réservation pour le moment.</p>

          <div class="modal-footer">
            <button class="btn-close" (click)="close()">Fermer</button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 3rem; background: #f8fafc; min-height: 100vh; font-family: sans-serif; padding-bottom: 5rem; }
    .list-header { display: flex; justify-content: space-between; align-items: center; max-width: 1100px; margin: 0 auto 3rem auto; }
    .title { font-size: 2.2rem; color: #003d3d; font-weight: 800; margin: 0; }

    .btn-create { 
      background: #00aaff; color: white; padding: 0.8rem 1.5rem; 
      border-radius: 50px; text-decoration: none; font-weight: bold;
      box-shadow: 0 4px 15px rgba(0, 170, 255, 0.3); transition: 0.3s;
    }

    .trajets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 1.5rem; max-width: 1100px; margin: 0 auto; }
    .trajet-card { background: white; border-radius: 18px; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }

    .card-content { display: flex; justify-content: space-between; align-items: center; }
    .city { font-size: 1.2rem; font-weight: 700; color: #1e293b; }
    .arrow { margin: 0 0.5rem; color: #00aaff; font-weight: bold; }
    .details-row { display: flex; gap: 1rem; color: #64748b; font-size: 0.85rem; margin-top: 0.5rem; }
    
    .price-action { text-align: right; border-left: 2px solid #f1f5f9; padding-left: 1.5rem; }
    .price-tag { font-size: 1.4rem; font-weight: 800; color: #003d3d; }
    .btn-manage { background: #f1f5f9; color: #475569; border: none; padding: 0.6rem 1rem; border-radius: 10px; cursor: pointer; font-weight: 600; margin-top: 0.8rem; }

    /* PAGINATION STYLES RÉTABLIS */
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1.2rem; margin-top: 4rem; }
    .pag-btn { background: white; color: #00aaff; border: 2px solid #00aaff; padding: 0.6rem 1.4rem; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.2s; }
    .pag-btn:disabled { border-color: #cbd5e1; color: #cbd5e1; cursor: not-allowed; }
    .pag-btn:not(:disabled):hover { background: #00aaff; color: white; }
    .pag-info { font-weight: 600; color: #64748b; }
    .pag-info span { color: #1e293b; font-weight: 800; }

    /* ACTION BUTTONS */
    .action-buttons { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
    .btn-confirm-res {
      background: #10b981; color: white; border: none; padding: 0.4rem 0.8rem;
      border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .btn-confirm-res:hover { background: #059669; }
    
    .btn-refuse {
      background: transparent; color: #ef4444; border: 1px solid #ef4444;
      padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .btn-refuse:hover { background: #ef4444; color: white; }

    .badge { padding: 0.4rem 0.8rem; border-radius: 10px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .badge.pending { background: #fef3c7; color: #92400e; }
    .badge.confirmed { background: #dcfce7; color: #166534; }
    .badge.refused { background: #fee2e2; color: #991b1b; }

    .overlay { position: fixed; inset: 0; background: rgba(0,61,61,0.4); backdrop-filter: blur(5px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal { background: white; padding: 2rem; border-radius: 24px; width: 100%; max-width: 550px; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
    .res-item { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 0; border-bottom: 1px solid #f1f5f9; }
    .res-user { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 45px; height: 45px; background: #e0f2fe; color: #00aaff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    
    .btn-close { background: #003d3d; color: white; border: none; padding: 0.8rem 2rem; border-radius: 12px; cursor: pointer; font-weight: bold; margin-top: 2rem; width: 100%; }
    .empty { text-align: center; color: #64748b; margin-top: 5rem; font-size: 1.2rem; }
  `]
})
export class MyTrajetsComponent implements OnInit, OnDestroy {
  trajets: Trajet[] = [];
  reservations: Reservation[] = [];
  selectedTrajet: Trajet | null = null;
  private sub!: Subscription;
  currentPage = 1;
  itemsPerPage = 4;

  constructor(
    private trajetSrv: TrajetService,
    private reservationSrv: ReservationService,
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
    this.trajetSrv.getMyTrajets().subscribe(t => {
      this.trajets = t ?? [];
      this.cd.detectChanges();
    });
  }

  paginatedTrajets() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.trajets.slice(start, start + this.itemsPerPage);
  }

  totalPages() { return Math.ceil(this.trajets.length / this.itemsPerPage); }
  nextPage() { if (this.currentPage < this.totalPages()) this.currentPage++; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }

  openReservations(t: Trajet) {
    if (!t.id) return;
    this.selectedTrajet = t;
    this.reservationSrv.byTrajet(t.id).subscribe({
      next: r => { this.reservations = r ?? []; this.cd.detectChanges(); },
      error: err => { console.error(err); this.reservations = []; }
    });
  }

  confirm(id: number) {
    if(confirm("Confirmer cette réservation ?")) {
      this.reservationSrv.confirm(id).subscribe({
        next: () => {
          const res = this.reservations.find(r => r.id === id);
          if (res) res.status = 'CONFIRMED';
          this.cd.detectChanges();
        },
        error: err => alert("Erreur lors de la confirmation")
      });
    }
  }

  refuse(id: number) {
    if(confirm("Refuser cette réservation ?")) {
      this.reservationSrv.refuse(id).subscribe({
        next: () => {
          const res = this.reservations.find(r => r.id === id);
          if (res && this.selectedTrajet) {
            res.status = 'REFUSED';
            this.selectedTrajet.placesDisponibles = (this.selectedTrajet.placesDisponibles ?? 0) + res.placesReservees;
            this.cd.detectChanges();
          }
        },
        error: err => console.error(err)
      });
    }
  }

  close() { this.selectedTrajet = null; this.reservations = []; }
}