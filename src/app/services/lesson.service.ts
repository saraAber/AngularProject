import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/courses'; // בסיס URL לקורסים

  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.baseUrl}/${courseId}/lessons`);
  }

 createLesson(courseId: number, lesson: { title: string; content: string; courseId: number }): Observable<Lesson> {
  return this.http.post<Lesson>(`${this.baseUrl}/${courseId}/lessons`, lesson);
}

  // updateLesson(lessonId: number, lesson: Partial<Omit<Lesson, 'id' | 'courseId' | 'courseId'>>): Observable<Lesson> {
  //   return this.http.put<Lesson>(`http://localhost:3000/api/lessons/${lessonId}`, lesson);
  // }

  updateLesson(courseId: number, lessonId: number, lesson: Partial<Omit<Lesson, 'id'>>): Observable<Lesson> {
    return this.http.put<Lesson>(`http://localhost:3000/api/courses/${courseId}/lessons/${lessonId}`, lesson);
  }

  deleteLesson(courseId: number, lessonId: number): Observable<void> {
    return this.http.delete<void>(`http://localhost:3000/api/courses/${courseId}/lessons/${lessonId}`);
  }
}