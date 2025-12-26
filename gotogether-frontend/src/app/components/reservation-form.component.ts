import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../services/reservation.service';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-reservation-form',
  template: `
    <section class="form-container">
      <h2>Créer une réservation</h2>

      <form (ngSubmit)="submit()" class="reservation-form">
        <div class="form-group">
          <label for="trajetId">Trajet ID</label>
          <input id="trajetId" [(ngModel)]="trajetId" name="trajetId" required placeholder="Ex: 123"/>
        </div>

        <div class="form-group">
          <label for="places">Nombre de places</label>
          <input id="places" type="number" [(ngModel)]="places" name="places" min="1" required placeholder="1"/>
        </div>

        <button class="btn primary" type="submit">Créer</button>
      </form>

      <p *ngIf="message" class="feedback">{{ message }}</p>
    </section>
  `,
  styles: [`
    .form-container {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.1);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #264653;
    }

    .reservation-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      margin-bottom: 0.3rem;
      font-weight: 600;
      color: #333;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 0.5rem;
      font-size: 0.95rem;
      transition: border-color 0.3s;
    }

    input:focus {
      border-color: #2a9d8f;
      outline: none;
      box-shadow: 0 0 5px rgba(42,157,143,0.3);
    }

    .btn.primary {
      background-color: #2a9d8f;
      color: white;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s, transform 0.2s;
    }

    .btn.primary:hover {
      background-color: #21867a;
      transform: translateY(-2px);
    }

    .feedback {
      margin-top: 1rem;
      text-align: center;
      font-weight: 500;
      color: #e76f51;
    }

    @media (max-width: 500px) {
      .form-container {
        padding: 1.5rem;
        margin: 1rem;
      }
    }
  `]
})
export class ReservationFormComponent {
  trajetId = 0;
  places = 1;
  message = '';

  constructor(private srv: ReservationService, private authSrv: AuthService) {}

  submit() {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    if (!user) {
      this.message = 'Vous devez être connecté pour réserver';
      return;
    }

    const payload = {
      trajetId: Number(this.trajetId),
      placesReservees: Number(this.places),
      passagerId: user.id,
      fullName: user.fullName,
      phone: user.phone
    };

    this.srv.create(payload).subscribe({
      next: () => this.message = 'Réservation créée avec succès ✅',
      error: (e) => this.message = 'Erreur: ' + e?.message
    });
  }
}
