import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '../stores/user/user.state';

interface AuthResponse {
  token: string;
  userId: number;
  role: string;
}

interface Course { // Define the Course interface
  id: number;
  title: string;
  description: string;
  
  // ... other course properties
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:3000/api/users'; // Adjust the base URL
  private authUrl = 'http://localhost:3000/api/auth';
  private coursesUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  registerUser(name: string, email: string, password: string, role: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, { name, email, password, role });
  }

  loginUser(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, { email, password });
  }

  getUser(userId: number): Observable<User> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  
    return this.http.get<User>(`${this.baseUrl}/${userId}`, { headers }).pipe(
      tap(user => console.log('User Loaded:', user)),
      catchError(error => {
        console.error('getUser error:', error);
        throw error;
      }),
      map(user => ({ ...user, courseIds: user.courseIds || [] }))
    );
  }
  

  updateUser(userId: number, user: Partial<User>): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.baseUrl}/${userId}`, user);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${userId}`);
  }

  getUserCourses(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.coursesUrl}/student/${userId}`);
  }

  enrollUserInCourse(userId: number, courseId: number): Observable<any> {
    return this.http.post(`${this.coursesUrl}/${courseId}/enroll`, {userId});
  }

  unenrollUserFromCourse(userId: number, courseId: number): Observable<any> {
    return this.http.delete(`${this.coursesUrl}/${courseId}/unenroll`, {body:{userId}});
  }
}