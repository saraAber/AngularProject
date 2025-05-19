import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course } from '../../models/course.model';
import { Lesson } from '../../models/lesson.model';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/courses.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  lessonService = inject(LessonService);
  courseService = inject(CourseService);
  courseId = signal<number | null>(null);
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  isLoadingCourse = signal<boolean>(true);
  isLoadingLessons = signal<boolean>(true);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseId.set(+params['id']);
      if (this.courseId()) {
        this.loadCourseDetails();
        this.loadLessons();
      }
    });
  }

  loadCourseDetails() {
    this.isLoadingCourse.set(true);
    this.courseService.getCourseById(this.courseId()!).subscribe({
      next: (course) => this.course.set(course),
      error: (err) => console.error('שגיאה בטעינת פרטי קורס:', err),
      complete: () => this.isLoadingCourse.set(false)
    });
  }

  loadLessons() {
    this.isLoadingLessons.set(true);
    this.lessonService.getLessonsByCourseId(this.courseId()!).subscribe({
      next: (lessons) => this.lessons.set(lessons),
      error: (err) => console.error('שגיאה בטעינת שיעורים:', err),
      complete: () => this.isLoadingLessons.set(false)
    });
  }

  goBackToCourses() {
    this.router.navigate(['/courses']);
  }
}