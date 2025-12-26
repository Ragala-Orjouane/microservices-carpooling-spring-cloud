import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-login-success',
  template: `
    <section class="login-success">
      <div class="card">
        <h2>Connexion réussie</h2>
        <p>Vous êtes connecté·e. Vous pouvez fermer cette fenêtre ou revenir à l'application.</p>
      </div>
    </section>
  `,
  styles: [
    `
    .login-success { display:flex; justify-content:center; padding:2rem }
    .card { max-width:720px; background:#fff; padding:1.2rem; border-radius:10px; box-shadow:0 6px 20px rgba(0,0,0,0.06); text-align:center }
    h2 { margin:0 0 0.5rem }
    `
  ]
})
export class LoginSuccessComponent {}
