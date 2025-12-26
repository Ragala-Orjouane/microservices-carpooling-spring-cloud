import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrajetService } from '../services/trajet.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-create-trajet',
  template: `
    <div class="page-container">
      <div class="create-card">
        <header class="card-header">
          <span class="icon-circle">🚗</span>
          <h2>Publier un trajet</h2>
          <p class="subtitle">Partagez vos frais et voyagez en bonne compagnie.</p>
        </header>

        <form (ngSubmit)="submit()" class="publish-form">
          <div class="form-grid">
            
            <div class="field">
              <label>Ville de départ</label>
              <div class="select-wrapper">
                <select [(ngModel)]="depart" name="depart" (change)="onDepartChange(); updateEstimate()" required>
                  <option value="" disabled selected>D'où partez-vous ?</option>
                  <option *ngFor="let c of getFilteredDepartCities()" [value]="c">{{c}}</option>
                </select>
              </div>
            </div>

            <div class="field shift-right">
              <label>Ville d'arrivée</label>
              <div class="select-wrapper">
                <select [(ngModel)]="arrivee" name="arrivee" (change)="onArriveeChange(); updateEstimate()" required>
                  <option value="" disabled selected>Où allez-vous ?</option>
                  <option *ngFor="let c of getFilteredArriveeCities()" [value]="c">{{c}}</option>
                </select>
              </div>
            </div>

            <div class="field">
              <label>Date et heure de départ</label>
              <input type="datetime-local" [(ngModel)]="dateHeure" name="dateHeure" required />
            </div>

            <div class="field shift-right">
              <label>Nombre de places</label>
              <div class="passenger-picker">
                <button type="button" class="picker-btn" (click)="decreasePlaces()" [disabled]="places <= 1">−</button>
                <span class="places-count">{{places}} {{ places > 1 ? 'passagers' : 'passager' }}</span>
                <button type="button" class="picker-btn" (click)="increasePlaces()" [disabled]="places >= 8">+</button>
              </div>
            </div>
          </div>

          <div class="estimation-banner" *ngIf="previewDistance && previewPrice">
            <div class="est-item">
              <span class="est-label">Distance</span>
              <span class="est-value">{{previewDistance | number:'1.0-1'}} km</span>
            </div>
            <div class="divider"></div>
            <div class="est-item">
              <span class="est-label">Prix suggéré</span>
              <span class="est-value highlight">{{previewPrice | number:'1.0-2'}} DH</span>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-cancel" type="button" (click)="cancel()">Annuler</button>
            <button class="btn-submit" type="submit" [disabled]="!depart || !arrivee || !dateHeure">
              Publier le trajet
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { --primary: #00aaff; --dark: #003d3d; --text: #1e293b; }

    .page-container {
      min-height: 85vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .create-card {
      background: white;
      width: 100%;
      max-width: 750px; /* Augmenté pour plus d'espace */
      border-radius: 24px;
      padding: 3.5rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);
    }

    .card-header { text-align: center; margin-bottom: 2.5rem; }
    .icon-circle { 
      font-size: 2rem; 
      background: #f0f9ff; 
      width: 60px; height: 60px; 
      display: flex; align-items: center; justify-content: center; 
      margin: 0 auto 1rem; 
      border-radius: 50%;
    }
    
    h2 { color: var(--dark); font-size: 1.8rem; font-weight: 800; margin: 0; }
    .subtitle { color: #64748b; margin-top: 0.5rem; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 3rem; /* Augmentation de l'espace entre les colonnes */
      row-gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    /* Décalage supplémentaire pour la colonne de droite sur Desktop */
    .shift-right {
      padding-left: 1rem; 
    }

    @media (max-width: 650px) { 
      .form-grid { grid-template-columns: 1fr; } 
      .shift-right { padding-left: 0; }
    }

    .field { display: flex; flex-direction: column; gap: 0.5rem; }
    label { font-size: 0.85rem; font-weight: 700; color: var(--dark); margin-left: 4px; }

    select, input {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: #fcfcfd;
      font-size: 1rem;
      transition: all 0.2s;
    }

    select:focus, input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(0, 170, 255, 0.1);
      background: white;
    }

    .passenger-picker {
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 12px;
      padding: 4px;
      justify-content: space-between;
    }
    .picker-btn {
      width: 38px; height: 38px;
      border: none;
      background: white;
      border-radius: 8px;
      font-size: 1.2rem;
      font-weight: bold;
      cursor: pointer;
      color: var(--primary);
      transition: 0.2s;
    }
    .picker-btn:hover:not(:disabled) { background: var(--primary); color: white; }
    .picker-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .places-count { font-weight: 700; color: var(--dark); font-size: 0.9rem; }

    .estimation-banner {
      background: #003d3d;
      color: white;
      border-radius: 16px;
      padding: 1.2rem 2rem;
      display: flex;
      justify-content: space-around;
      align-items: center;
      margin-bottom: 2.5rem;
      animation: fadeIn 0.4s ease-out;
    }
    .est-item { text-align: center; }
    .est-label { display: block; font-size: 0.75rem; text-transform: uppercase; opacity: 0.7; letter-spacing: 1px; }
    .est-value { display: block; font-size: 1.2rem; font-weight: 700; }
    .highlight { color: var(--primary); }
    .divider { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }

    .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn-submit {
      flex: 2;
      background: var(--primary);
      color: white;
      border: none;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.3s;
    }
    .btn-submit:hover:not(:disabled) { background: #0088cc; transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 170, 255, 0.3); }
    .btn-submit:disabled { background: #cbd5e1; cursor: not-allowed; }

    .btn-cancel {
      flex: 1;
      background: white;
      color: #64748b;
      border: 1px solid #e2e8f0;
      padding: 1rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class CreateTrajetComponent {
  depart = '';
  arrivee = '';
  dateHeure = '';
  places = 1;
  previewDistance?: number;
  previewPrice?: number;

  private srv = inject(TrajetService);
  private router = inject(Router);
  private auth = inject(AuthService);

  cities: string[] = [
    "Agadir", "Al Hoceima", "Beni Mellal", "Casablanca", "Chefchaouen", 
    "Dakhla", "El Jadida", "Errachidia", "Essaouira", "Fes", "Ifrane", 
    "Kenitra", "Laayoune", "Marrakesh", "Meknes", "Mohammedia", "Nador", 
    "Ouarzazate", "Oujda", "Rabat", "Safi", "Settat", "Tangier", "Taza", "Tiznit"
  ];

  getFilteredDepartCities() { return this.cities.filter(c => c !== this.arrivee); }
  getFilteredArriveeCities() { return this.cities.filter(c => c !== this.depart); }

  onDepartChange() { if(this.depart === this.arrivee) this.arrivee=''; }
  onArriveeChange() { if(this.arrivee === this.depart) this.depart=''; }

  updateEstimate() {
    this.previewDistance = undefined;
    this.previewPrice = undefined;
    if(!this.depart || !this.arrivee) return;
    this.srv.estimate(this.depart, this.arrivee).subscribe({
      next: (res:any) => { this.previewDistance = res.distance; this.previewPrice = res.prix; },
      error: (e) => console.warn('Estimate failed', e)
    });
  }

  submit() {
    if(!this.depart || !this.arrivee) return;
    const conducteurId = this.auth.getCurrentUserId();
    const payload: any = { 
      depart: this.depart, 
      arrivee: this.arrivee, 
      dateHeureDepart: this.dateHeure, 
      placesDisponibles: this.places 
    };
    if (conducteurId != null) payload.conducteurId = conducteurId;
    
    this.srv.create(payload).subscribe({
      next: () => this.router.navigate(['/trajets']),
      error: (e) => alert('Erreur: ' + (e?.error?.message || e?.message))
    });
  }

  increasePlaces() { if(this.places < 8) this.places++; }
  decreasePlaces() { if(this.places > 1) this.places--; }
  cancel() { this.router.navigate(['/trajets']); }
}