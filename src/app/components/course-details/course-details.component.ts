// import { Component, inject, signal, OnInit } from '@angular/core';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { Course } from '../../models/course.model';
// import { Lesson } from '../../models/lesson.model';
// import { LessonService } from '../../services/lesson.service';
// import { CourseService } from '../../services/courses.service';
// import { MatCardModule } from '@angular/material/card';
// import { MatListModule } from '@angular/material/list';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { AsyncPipe } from '@angular/common';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';

// @Component({
//   selector: 'app-course-details',
//   standalone: true,
//   imports: [
//     MatCardModule,
//     MatListModule,
//     MatProgressSpinnerModule,
//     AsyncPipe,
//     MatButtonModule,
//     MatIconModule,
//     RouterLink,
//   ],
//   templateUrl: './course-details.component.html',
//   styleUrl: './course-details.component.css'
// })
// export class CourseDetailsComponent implements OnInit {
//   route = inject(ActivatedRoute);
//   router = inject(Router);
//   lessonService = inject(LessonService);
//   courseService = inject(CourseService);
//   courseId = signal<number | null>(null);
//   course = signal<Course | null>(null);
//   lessons = signal<Lesson[]>([]);
//   isLoadingCourse = signal<boolean>(true);
//   isLoadingLessons = signal<boolean>(true);

//   ngOnInit(): void {
//     this.route.params.subscribe(params => {
//       this.courseId.set(+params['id']);
//       if (this.courseId()) {
//         this.loadCourseDetails();
//         this.loadLessons();
//       }
//     });
//   }

//   loadCourseDetails() {
//     this.isLoadingCourse.set(true);
//     this.courseService.getCourseById(this.courseId()!).subscribe({
//       next: (course) => this.course.set(course),
//       error: (err) => console.error('שגיאה בטעינת פרטי קורס:', err),
//       complete: () => this.isLoadingCourse.set(false)
//     });
//   }

//   loadLessons() {
//     this.isLoadingLessons.set(true);
//     this.lessonService.getLessonsByCourseId(this.courseId()!).subscribe({
//       next: (lessons) => this.lessons.set(lessons),
//       error: (err) => console.error('שגיאה בטעינת שיעורים:', err),
//       complete: () => this.isLoadingLessons.set(false)
//     });
//   }

//   goBackToCourses() {
//     this.router.navigate(['/courses']);
//   }
// }

// src/app/components/course-details/course-details.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Course } from '../../models/course.model';
import { Lesson } from '../../models/lesson.model';
import { LessonService } from '../../services/lesson.service';
import { CourseService } from '../../services/courses.service';
import { UserService } from '../../services/user.service'; // ייבוא UserService
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, CommonModule } from '@angular/common'; // הוסף CommonModule אם לא הוספת קודם
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider'; // ייבוא MatDividerModule

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
    CommonModule, // וודא ש-CommonModule מיובא עבור if/for וכו'
    MatDividerModule, // וודא ש-MatDividerModule מיובא
  ],
  templateUrl: './course-details.component.html',
  styleUrl: './course-details.component.css'
})
export class CourseDetailsComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  lessonService = inject(LessonService);
  courseService = inject(CourseService);
  userService = inject(UserService); // הזרק את UserService

  courseId = signal<number | null>(null);
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  teacherName = signal<string>('טוען...'); // סיגנל חדש לשם המורה

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
      next: (course) => {
        this.course.set(course);
        if (course && course.teacherId) {
          this.loadTeacherName(course.teacherId); // טען את שם המורה לאחר טעינת הקורס
        } else {
          this.teacherName.set('לא ידוע');
        }
      },
      error: (err) => {
        console.error('שגיאה בטעינת פרטי קורס:', err);
        this.isLoadingCourse.set(false);
        this.course.set(null); // כדי להציג הודעת שגיאה
      },
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

  loadTeacherName(teacherId: number) {
    this.userService.getUser(teacherId).subscribe({
      next: (user) => {
        this.teacherName.set(user.name);
      },
      error: (err) => {
        console.error('שגיאה בטעינת שם המורה:', err);
        this.teacherName.set('לא ידוע'); // במקרה של שגיאה או אם המורה לא נמצא
      }
    });
  }

  goBackToCourses() {
    this.router.navigate(['/courses']);
  }
}

