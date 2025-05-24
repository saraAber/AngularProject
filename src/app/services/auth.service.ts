import { Injectable, inject } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { environment } from '../../environments/environment';
    interface AuthResponse {
      token: string;
      userId: number;
      role: string;
    }
    
    @Injectable({
      providedIn: 'root',
    })
    export class AuthService {
      private http = inject(HttpClient);
      private apiUrl = environment.apiUrl + '/api/auth'; // Adjust the API URL
    
      login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
      }
    
      register(userData: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
      }
    }

