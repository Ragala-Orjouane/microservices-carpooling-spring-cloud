import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';

import { Trajet } from '../models/trajet';
import { ReservationService } from '../services/reservation.service';
import { TrajetService } from '../services/trajet.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-trajets-list',
  imports: [CommonModule, FormsModule],
  template: `
<section class="page">

  <h1 class="title">Où voulez-vous aller ?</h1>

  <div class="search-bar">
    <div class="input-wrapper">
      <input type="text" placeholder="Départ" [(ngModel)]="search.depart" (input)="applyFilter()">
    </div>
    <div class="input-wrapper">
      <input type="text" placeholder="Destination" [(ngModel)]="search.arrivee" (input)="applyFilter()">
    </div>
    <div class="input-wrapper">
      <input type="date" [(ngModel)]="search.date" (change)="applyFilter()">
    </div>
    <div class="input-wrapper">
      <input type="number" min="1" [(ngModel)]="search.passagers" (input)="applyFilter()" placeholder="Passagers">
    </div>
    <button class="btn-search" (click)="applyFilter()">Rechercher</button>
  </div>

  <div class="trajets">
    <p *ngIf="filteredTrajets.length === 0" class="empty">Aucun trajet trouvé</p>

    <div class="trajet-card" *ngFor="let t of paginatedTrajets()">
      <div class="card-main">
        <div class="route-info">
          <div class="cities">
            <span class="city">{{ t.depart }}</span>
            <span class="arrow">→</span>
            <span class="city">{{ t.arrivee }}</span>
          </div>
          <div class="details-row">
            <span class="detail-item">📅 {{ t.dateHeureDepart | date:'EEEE d MMMM' }}</span>
            <span class="detail-item">🕒 {{ t.dateHeureDepart | date:'HH:mm' }}</span>
            <span class="detail-item" [class.low-stock]="(t.placesDisponibles ?? 0) < 3">
              💺 {{ t.placesDisponibles }} places
            </span>
          </div>
        </div>
        
        <div class="price-action">
          <div class="price-tag">{{ t.prix | number:'1.2-2' }} <span>DH</span></div>
          <button class="btn-reserver" (click)="handleReserve(t)">
            {{ (t.placesDisponibles ?? 0) > 0 ? 'Réserver' : 'Complet' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="pagination-container" *ngIf="totalPages() > 1">
    <button class="pag-btn" (click)="prevPage()" [disabled]="currentPage === 1">Précédent</button>
    <div class="pag-info">Page <span>{{ currentPage }}</span> sur {{ totalPages() }}</div>
    <button class="pag-btn" (click)="nextPage()" [disabled]="currentPage === totalPages()">Suivant</button>
  </div>

  <div class="overlay" *ngIf="selected" (click)="close()">
    <div class="modal" (click)="$event.stopPropagation()">
      <h3>Réserver ce trajet</h3>
      <p class="modal-sub">{{ selected.depart }} → {{ selected.arrivee }}</p>
      <div class="places-selector">
        <button (click)="decreasePlaces()">−</button>
        <span>{{ reserveCount }}</span>
        <button (click)="increasePlaces()">+</button>
      </div>
      <div class="modal-actions">
        <button class="btn-confirm" (click)="confirmReservation()">Confirmer</button>
        <button class="btn-cancel" (click)="close()">Annuler</button>
      </div>
    </div>
  </div>
</section>
`,
  styles: [`
    .page { padding:3rem; background:#f8fafc; font-family:sans-serif; min-height: 100vh; padding-bottom: 5rem; }
    .title { text-align:center; font-size:2.6rem; margin-bottom:2.5rem; color:#003d3d; font-weight: 800; }
    
    /* Correction : Ajout de margin-bottom pour décoller la liste */
    .search-bar { 
      display:flex; max-width:1100px; margin: 0 auto 4rem auto; 
      border-radius:50px; background: white; padding: 0.5rem; 
      box-shadow:0 12px 35px rgba(0,0,0,0.08); 
    }

    .input-wrapper { flex:1; border-right: 1px solid #eee; display:flex; align-items:center; }
    .input-wrapper:last-of-type { border:none; }
    .search-bar input { width:100%; border:none; padding:1rem; outline: none; font-size: 1rem; background: transparent; }
    .btn-search { background:#00aaff; color:white; border:none; padding:0 2.5rem; border-radius:40px; cursor:pointer; font-weight:bold; }
    
    .trajets { max-width:900px; margin:0 auto; }
    .trajet-card { background: white; border-radius: 18px; margin-bottom: 1.5rem; padding: 1.5rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
    .card-main { display: flex; justify-content: space-between; align-items: center; }
    .city { font-size: 1.3rem; font-weight: 700; color: #1e293b; }
    .arrow { margin: 0 0.8rem; color: #00aaff; font-weight: bold; }
    .details-row { display: flex; gap: 1.2rem; color: #64748b; font-size: 0.95rem; margin-top: 0.5rem; }
    .low-stock { color: #e11d48; font-weight: 600; }
    .price-action { text-align: right; border-left: 2px solid #f1f5f9; padding-left: 2rem; }
    .price-tag { font-size: 1.6rem; font-weight: 800; color: #003d3d; }
    .btn-reserver { background:#00c4a7; color:white; border:none; padding:0.7rem 2rem; border-radius:12px; cursor:pointer; font-weight: bold; margin-top: 0.5rem; }
    
    /* Pagination stylisée */
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1.2rem; margin-top: 3rem; }
    .pag-btn { background: white; color: #00aaff; border: 2px solid #00aaff; padding: 0.6rem 1.4rem; border-radius: 12px; cursor: pointer; font-weight: bold; }
    .pag-btn:disabled { border-color: #cbd5e1; color: #cbd5e1; cursor: not-allowed; }
    
    .overlay { position:fixed; inset:0; background:rgba(0,61,61,0.4); backdrop-filter: blur(5px); display:flex; justify-content:center; align-items:center; z-index:1000; }
    .modal { background:white; padding:2.5rem; border-radius:24px; width:360px; text-align: center; }
    .places-selector { display:flex; justify-content:center; align-items:center; gap:2rem; margin:2rem 0 }
    .places-selector button { width:45px; height:45px; border-radius:50%; border:none; background:#f1f5f9; color:#00aaff; font-size:1.5rem; cursor: pointer; }
    .modal-actions { display:flex; flex-direction: column; gap: 0.8rem; }
    .btn-confirm { background:#003d3d; color:white; border:none; padding:1rem; border-radius:12px; cursor: pointer; font-weight: bold; }
    .btn-cancel { background:transparent; color:#64748b; border:none; padding:0.5rem; cursor: pointer; }
    .empty { text-align: center; color: #64748b; margin-top: 2rem; }
  `]
})
export class TrajetsListComponent implements OnInit, OnDestroy {
  trajets: Trajet[] = [];
  filteredTrajets: Trajet[] = [];
  selected: Trajet | null = null;
  reserveCount = 1;
  search = { depart: '', arrivee: '', passagers: 1, date: '' };
  
  // Correction pagination : on affiche 3 trajets par page pour tester plus facilement
  currentPage = 1;
  itemsPerPage = 3; 
  private routerSub!: Subscription;

  constructor(
    private trajetSrv: TrajetService,
    private reservationSrv: ReservationService,
    private router: Router,
    private cd: ChangeDetectorRef,
    public authSrv: AuthService
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
    this.trajetSrv.getTrajets().subscribe({
      next: (data) => {
        this.trajets = data ?? [];
        this.applyFilter();
      }
    });
  }

  applyFilter() {
    const userId = this.authSrv.getCurrentUserId();
    this.filteredTrajets = this.trajets.filter(t => {
      const isNotMine = t.conducteurId !== userId;
      const matchDep = !this.search.depart || t.depart.toLowerCase().includes(this.search.depart.toLowerCase());
      const matchArr = !this.search.arrivee || t.arrivee.toLowerCase().includes(this.search.arrivee.toLowerCase());
      const matchPlaces = (t.placesDisponibles ?? 0) >= this.search.passagers;
      
      let matchDate = true;
      if (this.search.date && t.dateHeureDepart) {
        const d = new Date(t.dateHeureDepart);
        if (!isNaN(d.getTime())) {
            const trajetDateStr = d.toISOString().split('T')[0];
            matchDate = (trajetDateStr === this.search.date);
        }
      }
      return isNotMine && matchDep && matchArr && matchPlaces && matchDate;
    });
    this.currentPage = 1;
    this.cd.detectChanges();
  }

  paginatedTrajets() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredTrajets.slice(start, start + this.itemsPerPage);
  }

  totalPages() { 
    return Math.ceil(this.filteredTrajets.length / this.itemsPerPage); 
  }

  nextPage() { if(this.currentPage < this.totalPages()) this.currentPage++; window.scrollTo(0,0); }
  prevPage() { if(this.currentPage > 1) this.currentPage--; window.scrollTo(0,0); }

  handleReserve(t: Trajet) {
    if (this.authSrv.isLoggedIn()) {
      this.selected = t;
      this.reserveCount = 1;
    } else {
      this.router.navigate(['/login']);
    }
  }

  close() { this.selected = null; }
  increasePlaces() { if (this.selected && this.reserveCount < (this.selected.placesDisponibles ?? 1)) this.reserveCount++; }
  decreasePlaces() { if (this.reserveCount > 1) this.reserveCount--; }

  confirmReservation() {
    if (!this.selected?.id) return;
    this.reservationSrv.create({ trajetId: this.selected.id, placesReservees: this.reserveCount }).subscribe({
      next: () => {
        this.trajetSrv.reserveTrajet(this.selected!.id!, this.reserveCount).subscribe({
          next: () => {
            this.close();
            this.load();
          }
        });
      }
    });
  }
}