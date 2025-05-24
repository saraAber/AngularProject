import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl + '/api/courses'; // בסיס URL לקורסים

  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseUrl}/${courseId}/lessons`);
  }

 createLesson(courseId: number, lesson: { title: string; content: string; courseId: number }): Observable<Lesson> {
  return this.http.post<Lesson>(`${this.baseUrl}/${courseId}/lessons`, lesson);
}

  updateLesson(courseId: number, lessonId: number, lesson: Partial<Omit<Lesson, 'id'>>): Observable<Lesson> {
    return this.http.put<Lesson>(`${this.baseUrl}/${courseId}/lessons/${lessonId}`, lesson);
  }

  deleteLesson(courseId: number, lessonId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}/lessons/${lessonId}`);
  }
}