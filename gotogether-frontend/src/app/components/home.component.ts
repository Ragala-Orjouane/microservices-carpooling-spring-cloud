import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  selector: 'app-home',
  template: `
    <section class="hero">
      <div class="hero-inner">
        
        <div class="welcome-msg" *ngIf="isLoggedIn">
           👋 Bonjour <strong>{{ userName }}</strong>, vous êtes le bienvenu !
        </div>

        <span class="badge" *ngIf="!isLoggedIn">
           🚀 Rejoignez la communauté GoTogether
        </span>

        <h1>Voyagez plus intelligemment, <span>ensemble</span>.</h1>
        <p>Réduisez vos frais de déplacement et participez à un transport plus durable au Maroc.</p>
        
        <div class="actions">
          <a routerLink="/trajets" class="btn primary">Trouver un trajet</a>
          <a routerLink="/trajets/create" class="btn secondary">Proposer un trajet</a>
        </div>
      </div>
    </section>

    <section class="benefits">
      <div class="container">
        <div class="section-header">
          <h2>Plus qu'un simple trajet</h2>
          <p>Découvrez pourquoi des milliers de personnes choisissent le covoiturage chaque jour.</p>
        </div>
        <div class="benefits-grid">
          <div class="benefit-item">
            <div class="icon-box green">💰</div>
            <h3>Économisez gros</h3>
            <p>Divisez vos frais d'essence et de péage par le nombre de passagers.</p>
          </div>
          <div class="benefit-item">
            <div class="icon-box blue">🌍</div>
            <h3>Moins de pollution</h3>
            <p>Une voiture partagée, c'est trois voitures en moins sur la route.</p>
          </div>
          <div class="benefit-item">
            <div class="icon-box orange">🛣️</div>
            <h3>Trafic fluide</h3>
            <p>Moins de bouchons sur les routes.</p>
          </div>
          <div class="benefit-item">
            <div class="icon-box purple">🤝</div>
            <h3>Rencontres</h3>
            <p>Transformez vos trajets en moments de convivialité.</p>
          </div>
        </div>
      </div>
    </section>

    <ng-container *ngIf="!isLoggedIn">
      <section class="final-cta">
        <div class="container">
          <div class="cta-box">
            <h2>Prêt à changer votre façon de voyager ?</h2>
            <p>Inscrivez-vous gratuitement et commencez votre aventure avec GoTogether.</p>
            <a routerLink="/register" class="btn primary">C'est parti !</a>
          </div>
        </div>
      </section>
    </ng-container>
  `,
  styles: [`
    :host { display: block; font-family: 'Segoe UI', Roboto, sans-serif; color: #1e293b; background: white; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 2rem; }

    /* HERO */
    .hero { padding: 8rem 2rem; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); text-align: center; }
    
    .welcome-msg, .badge {
      display: inline-block;
      margin-bottom: 2rem;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .welcome-msg { background: rgba(0, 170, 255, 0.1); color: #0088cc; }
    .badge { background: #e0f2fe; color: #0369a1; }
    
    h1 { font-size: 4.2rem; margin: 0 0 2rem 0; font-weight: 900; color: #003d3d; line-height: 1.1; }
    h1 span { color: #00aaff; }
    .hero p { font-size: 1.4rem; color: #64748b; margin-bottom: 3rem; max-width: 700px; margin: 0 auto; }

    .actions { display: flex; justify-content: center; gap: 1.5rem; }
    .btn { padding: 1.2rem 2.5rem; border-radius: 15px; text-decoration: none; font-weight: 700; transition: 0.4s; cursor: pointer; display: inline-block; }
    .primary { background: #00aaff; color: white; border: none; box-shadow: 0 10px 20px rgba(0, 170, 255, 0.2); }
    .secondary { background: white; color: #003d3d; border: 2px solid #003d3d; }

    /* BENEFITS */
    .benefits { padding: 8rem 0; background: white; }
    .section-header { text-align: center; margin-bottom: 5rem; }
    .benefits-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 3rem; }
    .benefit-item { text-align: center; padding: 1rem; }
    .icon-box { width: 70px; height: 70px; border-radius: 20px; font-size: 2.5rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; }
    .green { background: #dcfce7; } .blue { background: #e0f2fe; } .orange { background: #ffedd5; } .purple { background: #f3e8ff; }

    /* FINAL CTA */
    .final-cta { padding: 6rem 0; clear: both; }
    .cta-box { background: #003d3d; color: white; padding: 5rem; border-radius: 40px; text-align: center; }
  `]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  userName = '';
  
  public authSrv = inject(AuthService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.authSrv.user$.subscribe({
      next: (user) => {
        this.isLoggedIn = !!user;
        this.userName = user?.fullName || 'Utilisateur';
        // Force la détection de changement
        this.cd.detectChanges();
      }
    });
  }
}