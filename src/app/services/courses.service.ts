

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Course } from '../models/course.model';
import { Observable, switchMap, from, concatMap, map } from 'rxjs';
import { Lesson } from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/courses';

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.baseUrl);
  }

  getCoursesByStudent(userId: number): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/student/${userId}`);
  }

  createCourse(course: Omit<Course, 'id'>): Observable<Course> {
    return this.http.post<Course>(this.baseUrl, course);
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
  }

  deleteCourse(courseId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${courseId}`);
  }
  updateCourse(courseId: number, course: Partial<Omit<Course, 'id'>>): Observable<Course> {
    return this.http.put<Course>(`${this.baseUrl}/${courseId}`, course);
  }
  
  createCourseWithLessons(courseWithLessons: {
    title: string;
    description: string;
    teacherId: number;
    lessons: Omit<Lesson, 'id' | 'courseId'>[];
  }): Observable<any> {
    return this.createCourse({
      title: courseWithLessons.title,
      description: courseWithLessons.description,
      teacherId: courseWithLessons.teacherId
    }).pipe(
      switchMap((newCourse: Course) => {
        if (courseWithLessons.lessons && courseWithLessons.lessons.length > 0) {
          return from(courseWithLessons.lessons).pipe(
            concatMap(lesson =>
              this.http.post(`${this.baseUrl}/${newCourse.id}/lessons`, {
                title: lesson.title,
                content: lesson.content
              })
            )
          );
        } else {
          return from([newCourse]);
        }
      })
    );
  }
}