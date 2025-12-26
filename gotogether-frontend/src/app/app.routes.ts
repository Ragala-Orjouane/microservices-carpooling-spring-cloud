import { Routes } from '@angular/router';
import { HomeComponent } from './components/home.component';
import { TrajetsListComponent } from './components/trajets-list.component';
import { TrajetDetailComponent } from './components/trajet-detail.component';
import { ReservationFormComponent } from './components/reservation-form.component';
import { AuthComponent } from './components/auth.component';
import { LoginSuccessComponent } from './components/login-success.component';
import { CreateTrajetComponent } from './components/create-trajet.component';
import { RegisterComponent } from './components/register.component';
import { MyTrajetsComponent } from './components/my-trajets.component';
import { MyReservationsComponent } from './components/my-reservations.component';
import { AuthGuard } from './guards/auth.guard';
import { NotificationsComponent } from './components/notifications.component';

export const routes: Routes = [
  // 🌍 PUBLIC
  { path: '', component: HomeComponent },
  { path: 'trajets', component: TrajetsListComponent },
  { path: 'trajets/create', component: CreateTrajetComponent, canActivate: [AuthGuard] },
  { path: 'trajets/:id', component: TrajetDetailComponent },

  { path: 'login', component: AuthComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login-success', component: LoginSuccessComponent },


  {
    path: 'reservations',
    component: ReservationFormComponent,
    canActivate: [AuthGuard]
  },
    { path: 'my-reservations', component: MyReservationsComponent, canActivate: [AuthGuard] },
  { path: 'my-trajets', component: MyTrajetsComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: '' }
];
