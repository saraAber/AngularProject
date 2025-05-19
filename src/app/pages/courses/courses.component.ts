

// import { Component, inject, signal, computed, OnInit } from '@angular/core';
// import { MatCardModule } from '@angular/material/card';
// import { MatButtonModule } from '@angular/material/button';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { CourseService } from '../../services/courses.service';
// import { Course } from '../../models/course.model';
// import { Store, select } from '@ngrx/store';
// import { selectCurrentUser } from '../../stores/user/user.selectors';
// import { enrollUserInCourse, unenrollUserFromCourse } from '../../stores/user/user.actions';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { MatIconModule } from '@angular/material/icon';
// import { MatDialog } from '@angular/material/dialog';
// import { AddCourseDialogComponent } from '../add-course-dialog/add-course-dialog.component';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-courses',
//   standalone: true,
//   imports: [
//     MatCardModule,
//     MatButtonModule,
//     MatProgressSpinnerModule,
//     MatIconModule,
//     // AddCourseDialogComponent,
//     // CourseDetailsDialogComponent,
//   ],
//   templateUrl: './courses.component.html',
//   styleUrl: './courses.component.css'
// })
// export class CoursesComponent implements OnInit {
//   private courseService = inject(CourseService);
//   private store = inject(Store);
//   private dialog = inject(MatDialog);
//   private snackBar = inject(MatSnackBar);
//   private router = inject(Router);

//   user = toSignal(this.store.pipe(select(selectCurrentUser)), { initialValue: null });
//   allCourses = signal<Course[]>([]);
//   userCourses = signal<Set<number>>(new Set());
//   isLoading = signal<boolean>(true);

//   isTeacher = computed(() => this.user()?.role === 'teacher');

//   ngOnInit(): void {
//     this.loadAllCourses();
//     this.loadUserCourses();
//   }

//   loadAllCourses() {
//     this.isLoading.set(true);
//     this.courseService.getAllCourses().subscribe({
//       next: (data) => this.allCourses.set(data),
//       error: (err) => {
//         console.error('שגיאה בטעינת קורסים:', err);
//         this.snackBar.open('שגיאה בטעינת הקורסים', 'סגור', { duration: 3000 });
//       },
//       complete: () => this.isLoading.set(false)
//     });
//   }

//   loadUserCourses() {
//     const userId = this.user()?.id;
//     if (!userId) return;

//     this.courseService.getCoursesByStudent(userId).subscribe({
//       next: (courses) => {
//         const ids = new Set(courses.map(c => c.id));
//         this.userCourses.set(ids);
//       },
//       error: (err) => {
//         console.error('שגיאה בשליפת קורסי המשתמש:', err);
//         this.snackBar.open('שגיאה בשליפת קורסי המשתמש', 'סגור', { duration: 3000 });
//       }
//     });
//   }

//   isEnrolled(courseId: number): boolean {
//     return this.userCourses().has(courseId);
//   }

//   toggleEnrollment(course: Course) {
//     const userId = this.user()?.id;
//     if (!userId) return;

//     const enrolled = this.isEnrolled(course.id);
//     const action = enrolled
//       ? unenrollUserFromCourse({ userId, courseId: course.id })
//       : enrollUserInCourse({ userId, courseId: course.id });

//     this.store.dispatch(action);

//     const updated = new Set(this.userCourses());
//     if (enrolled) {
//       updated.delete(course.id);
//     } else {
//       updated.add(course.id);
//     }
//     this.userCourses.set(updated);
//   }

//   openAddCourseDialog() {
//     const dialogRef = this.dialog.open(AddCourseDialogComponent, {
//       width: '400px',
//     });

//     dialogRef.afterClosed().subscribe(result => {
//       if (result) {
//         const teacherId = this.user()?.id;
//         if (teacherId) {
//           this.courseService.createCourse({ ...result, teacherId } as Course).subscribe({
//             next: () => {
//               this.snackBar.open('הקורס נוסף בהצלחה', 'סגור', { duration: 3000 });
//               this.loadAllCourses();
//             },
//             error: (err) => {
//               console.error('שגיאה בהוספת קורס:', err);
//               this.snackBar.open('שגיאה בהוספת הקורס', 'סגור', { duration: 3000 });
//             }
//           });
//         }
//       }
//     });
//   }

//   navigateToCourseDetails(course: Course) {
//     this.router.navigate(['/courses', course.id]);
//   }
// }


import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseService } from '../../services/courses.service';
import { Course } from '../../models/course.model';
import { Store, select } from '@ngrx/store';
import { selectCurrentUser } from '../../stores/user/user.selectors';
import { enrollUserInCourse, unenrollUserFromCourse } from '../../stores/user/user.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  user = toSignal(this.store.pipe(select(selectCurrentUser)), { initialValue: null });
  allCourses = signal<Course[]>([]);
  userCourses = signal<Set<number>>(new Set());
  isLoading = signal<boolean>(true);

  isTeacher = computed(() => this.user()?.role === 'teacher');

  ngOnInit(): void {
    this.loadAllCourses();
    this.loadUserCourses();
  }

  loadAllCourses() {
    this.isLoading.set(true);
    this.courseService.getAllCourses().subscribe({
      next: (data) => this.allCourses.set(data),
      error: (err) => {
        console.error('שגיאה בטעינת קורסים:', err);
        this.snackBar.open('שגיאה בטעינת הקורסים', 'סגור', { duration: 3000 });
      },
      complete: () => this.isLoading.set(false)
    });
  }

  loadUserCourses() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.courseService.getCoursesByStudent(userId).subscribe({
      next: (courses) => {
        const ids = new Set(courses.map(c => c.id));
        this.userCourses.set(ids);
      },
      error: (err) => {
        console.error('שגיאה בשליפת קורסי המשתמש:', err);
        this.snackBar.open('שגיאה בשליפת קורסי המשתמש', 'סגור', { duration: 3000 });
      }
    });
  }

  isEnrolled(courseId: number): boolean {
    return this.userCourses().has(courseId);
  }

  toggleEnrollment(course: Course) {
    const userId = this.user()?.id;
    if (!userId) return;

    const enrolled = this.isEnrolled(course.id);
    const action = enrolled
      ? unenrollUserFromCourse({ userId, courseId: course.id })
      : enrollUserInCourse({ userId, courseId: course.id });

    this.store.dispatch(action);

    const updated = new Set(this.userCourses());
    if (enrolled) {
      updated.delete(course.id);
    } else {
      updated.add(course.id);
    }
    this.userCourses.set(updated);
  }

  navigateToCourseDetails(course: Course) {
    this.router.navigate(['/courses', course.id]);
  }

  navigateToCourseManagement() {
    this.router.navigate(['/course-management']);
  }
}