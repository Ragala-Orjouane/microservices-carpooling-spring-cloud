import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-register',
  template: `
    <section class="auth-page">
      <div class="auth-card">
        <div class="logo-area">
          <span class="icon">✨</span>
          <h2>Créer un compte</h2>
          <p class="muted">Rejoignez la plus grande communauté de covoiturage au Maroc.</p>
        </div>

        <form (ngSubmit)="register()" #registerForm="ngForm">
          <div class="form-group">
            <label>Nom complet</label>
            <input 
              type="text" 
              [(ngModel)]="fullName" 
              name="fullName" 
              required 
              placeholder="Ex: Ahmed Alami">
          </div>

          <div class="form-group">
            <label>Adresse e-mail</label>
            <input 
              type="email" 
              [(ngModel)]="email" 
              name="email" 
              required 
              placeholder="votre@email.com">
          </div>

          <div class="form-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              [(ngModel)]="password" 
              name="password" 
              required 
              placeholder="Minimum 8 caractères">
          </div>

          <button type="submit" class="btn-primary" [disabled]="!registerForm.form.valid">
            S'inscrire gratuitement
          </button>
        </form>

        <p class="switch-auth">
          Déjà un compte ? <a routerLink="/login">Se connecter ici</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .auth-page {
      display: flex; 
      justify-content: center; 
      align-items: center; 
      padding: 3rem 1rem; 
      min-height: 90vh; 
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      font-family: 'Segoe UI', Roboto, sans-serif;
    }

    .auth-card {
      background: white;
      padding: 3rem 2.5rem;
      border-radius: 24px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
    }

    .logo-area { text-align: center; margin-bottom: 2rem; }
    .logo-area .icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
    
    h2 { margin: 0; font-size: 1.8rem; color: #003d3d; font-weight: 800; }
    .muted { color: #64748b; margin-top: 0.5rem; font-size: 0.95rem; }

    .form-group { margin-bottom: 1.2rem; text-align: left; }
    
    label { 
      display: block; 
      font-size: 0.85rem; 
      font-weight: 600; 
      color: #1e293b; 
      margin-bottom: 0.4rem; 
    }

    input { 
      width: 100%; 
      padding: 0.8rem 1rem; 
      border-radius: 12px; 
      border: 1px solid #e2e8f0; 
      background: #fcfcfd;
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    input:focus { 
      outline: none; 
      border-color: #00aaff; 
      background: white;
      box-shadow: 0 0 0 4px rgba(0, 170, 255, 0.1); 
    }

    .btn-primary {
      width: 100%;
      padding: 1rem;
      background: #00aaff;
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 1.5rem;
    }

    .btn-primary:hover { 
      background: #0088cc; 
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 170, 255, 0.3);
    }

    .btn-primary:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      transform: none;
    }

    .switch-auth { 
      margin-top: 2rem; 
      font-size: 0.9rem; 
      color: #64748b; 
      text-align: center;
    }

    .switch-auth a { 
      color: #00aaff; 
      text-decoration: none; 
      font-weight: 700;
    }

    .switch-auth a:hover { color: #003d3d; text-decoration: underline; }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';

  private http = inject(HttpClient);
  private router = inject(Router);

  register() {
    this.http.post('http://localhost:8080/api/users/register', {
      fullName: this.fullName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        alert('Compte créé avec succès ! Bienvenue chez GoTogether.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Impossible de créer le compte. Vérifiez vos informations.');
      }
    });
  }
}