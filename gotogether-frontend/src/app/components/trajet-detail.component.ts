import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TrajetService } from '../services/trajet.service';
import { ReservationService } from '../services/reservation.service';
import { Trajet } from '../models/trajet';

@Component({
  standalone: true,
  selector: 'app-trajet-detail',
  imports: [CommonModule, FormsModule],

  template: `
    <section class="detail" *ngIf="trajet; else loading">
      <h2>{{ trajet.depart }} → {{ trajet.arrivee }}</h2>

      <p>
        <strong>Date :</strong>
        {{ trajet.dateHeureDepart | date:'fullDate' }}
        {{ trajet.dateHeureDepart | date:'shortTime' }}
      </p>

      <p><strong>Prix :</strong> {{ trajet.prix ?? '—' }} DH</p>
      <p><strong>Places restantes :</strong> {{ trajet.placesDisponibles }}</p>

      <div class="reserve">
        <label>Places</label>
        <input type="number" min="1" [(ngModel)]="places" />
        <button (click)="reserve()" class="btn">Réserver</button>
      </div>

      <p *ngIf="message" class="msg">{{ message }}</p>
    </section>

    <ng-template #loading>
      <p class="detail muted">Chargement du trajet...</p>
    </ng-template>
  `
})
export class TrajetDetailComponent implements OnInit {

  trajet: Trajet | null = null;
  places = 1;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private trajetSrv: TrajetService,
    private reservationSrv: ReservationService   // ✅ AJOUT OBLIGATOIRE
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.trajetSrv.getTrajet(id).subscribe(t => this.trajet = t);
  }

  reserve(): void {
    if (!this.trajet?.id) return;

    this.reservationSrv.create({
      trajetId: this.trajet.id,
      placesReservees: this.places
    }).subscribe({
      next: () => this.message = 'Réservation envoyée (en attente de confirmation)',
      error: () => this.message = 'Erreur réservation'
    });
  }
}
