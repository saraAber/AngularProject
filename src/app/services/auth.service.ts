import { Injectable, inject } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';
    
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
      private apiUrl = 'http://localhost:3000/api/auth'; // Adjust the API URL
    
      login(credentials: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
      }
    
      register(userData: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
      }
    }

  //   {
  //     "id": 1,
  //     "name": "t1",
  //     "email": "T8@dd.com",
  //     "password": "$2b$12$26zCbBfnHo6xrnLKEG4mCudujzmJsyAPq1S1oC9nVkcllci6yo2W.",
  //     "role": "teacher"
  // }