import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { ReservationService } from '../services/reservation.service';
import { ReservationWithTrajetDTO } from '../models/reservation-with-trajet.dto';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-my-reservations',
  template: `
    <section class="page">
      <h1 class="title">Mes réservations</h1>

      <div class="container">
        <p *ngIf="reservations.length === 0" class="empty">
          Vous n'avez aucune réservation pour le moment.
        </p>

        <div class="reservations-list">
          <div *ngFor="let r of getPaginatedReservations()" class="reservation-card">
            <div class="card-main">
              <div class="route-info">
                <div class="cities">
                  <span class="city">{{ r.depart }}</span>
                  <span class="arrow">→</span>
                  <span class="city">{{ r.arrivee }}</span>
                </div>
                
                <div class="details-row">
                  <span class="detail-item">📅 {{ r.dateHeureDepart | date:'EEEE d MMMM' }}</span>
                  <span class="detail-item">🕒 {{ r.dateHeureDepart | date:'HH:mm' }}</span>
                  <span class="detail-item">👤 {{ r.conducteurNom }}</span>
                  <span class="detail-item">💺 {{ r.placesReservees }} {{ r.placesReservees > 1 ? 'places' : 'place' }}</span>
                </div>
              </div>

              <div class="status-action">
                <div class="price-tag">{{ r.prix | number:'1.2-2' }} <span>DH</span></div>
                
                <span class="badge" [ngClass]="{
                  'status-pending': r.status === 'PENDING',
                  'status-refused': r.status === 'REFUSED',
                  'status-confirmed': r.status === 'CONFIRMED'
                }">
                  {{ 
                    r.status === 'PENDING' ? 'En attente' : 
                    r.status === 'CONFIRMED' ? 'Confirmé' : 'Refusé' 
                  }}
                </span>

                <button *ngIf="r.status === 'PENDING'" 
                        class="btn-cancel-action" 
                        (click)="cancel(r.id)">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-container" *ngIf="getTotalPages() > 1">
          <button class="pag-btn" 
                  (click)="prevPage()" 
                  [disabled]="currentPage === 1">
            Précédent
          </button>
          
          <div class="pag-info">
            Page <span>{{ currentPage }}</span> sur {{ getTotalPages() }}
          </div>

          <button class="pag-btn" 
                  (click)="nextPage()" 
                  [disabled]="currentPage === getTotalPages()">
            Suivant
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 3rem; background: #f8fafc; min-height: 100vh; font-family: sans-serif; }
    .title { text-align: center; font-size: 2.6rem; margin-bottom: 3rem; color: #003d3d; font-weight: 800; }
    .container { max-width: 900px; margin: 0 auto; }

    .reservations-list { display: flex; flex-direction: column; gap: 1.5rem; }
    
    .reservation-card { 
      background: white; 
      border-radius: 18px; 
      padding: 1.8rem; 
      box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
      border: 1px solid #f1f5f9;
      transition: transform 0.2s ease;
      animation: fadeIn 0.4s ease-out;
    }
    
    .reservation-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(0,0,0,0.05); }

    .card-main { display: flex; justify-content: space-between; align-items: center; }

    .city { font-size: 1.3rem; font-weight: 700; color: #1e293b; }
    .arrow { margin: 0 0.8rem; color: #00aaff; font-weight: bold; }
    
    .details-row { 
      display: flex; 
      flex-wrap: wrap;
      gap: 1.2rem; 
      color: #64748b; 
      font-size: 0.95rem; 
      margin-top: 0.8rem; 
    }

    .status-action { 
      text-align: right; 
      border-left: 2px solid #f1f5f9; 
      padding-left: 2rem; 
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.6rem;
      min-width: 160px;
    }

    .price-tag { font-size: 1.5rem; font-weight: 800; color: #003d3d; }
    .price-tag span { font-size: 0.9rem; color: #64748b; font-weight: 400; }

    .badge {
      padding: 0.4rem 1rem;
      border-radius: 50px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-refused { background: #fee2e2; color: #991b1b; }

    .btn-cancel-action {
      background: transparent;
      color: #e11d48;
      border: 1px solid #e11d48;
      padding: 0.4rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      margin-top: 5px;
    }
    .btn-cancel-action:hover { background: #e11d48; color: white; }

    /* PAGINATION */
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1.2rem; margin-top: 4rem; }
    .pag-btn { 
      background: white; color: #00aaff; border: 2px solid #00aaff; 
      padding: 0.6rem 1.4rem; border-radius: 12px; cursor: pointer; 
      font-weight: bold; transition: 0.3s;
    }
    .pag-btn:disabled { border-color: #cbd5e1; color: #cbd5e1; cursor: not-allowed; }
    .pag-btn:not(:disabled):hover { background: #00aaff; color: white; }
    
    .pag-info { color: #64748b; }
    .pag-info span { font-weight: 800; color: #1e293b; }

    .empty { text-align: center; color: #64748b; margin-top: 4rem; font-size: 1.1rem; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  reservations: ReservationWithTrajetDTO[] = [];

  // CONFIGURATION PAGINATION
  currentPage = 1;
  pageSize = 3; // Nombre de trajets par page

  private routerSub!: Subscription;

  constructor(
    private reservationSrv: ReservationService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    if (this.routerSub) this.routerSub.unsubscribe();
  }

  load(): void {
    this.reservationSrv.byPassager().subscribe({
      next: res => {
        this.reservations = res ?? [];
        this.currentPage = 1; 
        this.cd.detectChanges();
      },
      error: err => console.error(err)
    });
  }

  // MÉTHODES DE PAGINATION
  getPaginatedReservations() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.reservations.slice(start, start + this.pageSize);
  }

  getTotalPages(): number {
    return Math.ceil(this.reservations.length / this.pageSize);
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.cd.detectChanges(); // Force la mise à jour de la vue
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cd.detectChanges(); // Force la mise à jour de la vue
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  cancel(id: number): void {
    if(confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      this.reservationSrv.cancel(id).subscribe({
        next: () => this.load(),
        error: err => alert("Impossible d'annuler : " + err.message)
      });
    }
  }
}