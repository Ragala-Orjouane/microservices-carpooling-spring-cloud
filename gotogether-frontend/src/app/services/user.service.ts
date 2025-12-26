import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

// Development: call utilisateurms directly (port 9003)
const BASE = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class UserService {

  private BASE = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.BASE}/${encodeURIComponent(email)}`);
  }
}
