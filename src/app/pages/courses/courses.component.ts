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
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Router, RouterLink } from '@angular/router';

// @Component({
//   selector: 'app-courses',
//   standalone: true,
//   imports: [
//     MatCardModule,
//     MatButtonModule,
//     MatProgressSpinnerModule,
//     MatIconModule,
//     RouterLink,
//   ],
//   templateUrl: './courses.component.html',
//   styleUrl: './courses.component.css'
// })
// export class CoursesComponent implements OnInit {
//   private courseService = inject(CourseService);
//   private store = inject(Store);
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

//   navigateToCourseDetails(course: Course) {
//     this.router.navigate(['/courses', course.id]);
//   }

//   navigateToCourseManagement() {
//     this.router.navigate(['/course-management']);
//   }
// }

// src/app/components/courses/courses.component.ts (או הנתיב המדויק אצלך)
import { Component, inject, signal, computed, OnInit, OnDestroy, Input } from '@angular/core';
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
import { UserService } from '../../services/user.service';
import { User } from '../../stores/user/user.state';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, tap } from 'rxjs/operators';

interface CourseWithIcon extends Course {
  icon?: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './courses.component.html',
  styleUrl: './courses.component.css'
})
export class CoursesComponent implements OnInit, OnDestroy {
  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private store = inject(Store);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  user = toSignal(this.store.pipe(select(selectCurrentUser)), { initialValue: null });
  allCourses = signal<CourseWithIcon[]>([]);
  userCourses = signal<Set<number>>(new Set());
  isLoading = signal<boolean>(true);
  teacherNames = signal<Map<number, string>>(new Map());

  // צבעי רקע חזקים ובולטים יותר
  @Input() cardBackgroundColorStart: string = '#40E0D0'; // טורקיז בהיר
  @Input() cardBackgroundColorEnd: string = '#10f41c';   // ירוק בהיר יותר

  isTeacher = computed(() => this.user()?.role === 'teacher');

  readonly techIcons = [
    'code', 'laptop_mac', 'data_object', 'cloud', 'terminal', 'devices',
    'storage', 'developer_mode', 'dns', 'security', 'analytics', 'memory',
    'build', 'insights', 'bug_report', 'science', 'settings_ethernet',
    'web', 'auto_awesome'
  ];

  private courseIcons = new Map<number, string>();

  ngOnInit(): void {
    this.loadAllCourses();
    this.loadUserCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAllCourses() {
    this.isLoading.set(true);
    this.courseService.getAllCourses().pipe(
      takeUntil(this.destroy$),
      tap(data => {
        const coursesWithIcons: CourseWithIcon[] = data.map(course => {
          if (!this.courseIcons.has(course.id)) {
            this.courseIcons.set(course.id, this.getRandomTechIcon());
          }
          return { ...course, icon: this.courseIcons.get(course.id) };
        });
        this.allCourses.set(coursesWithIcons);
      }),
      catchError(err => {
        console.error('שגיאה בטעינת קורסים:', err);
        this.snackBar.open('שגיאה בטעינת הקורסים', 'סגור', { duration: 3000 });
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe(data => {
      this.loadTeacherNames(data);
      this.isLoading.set(false);
    });
  }

  loadUserCourses() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.courseService.getCoursesByStudent(userId).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('שגיאה בשליפת קורסי המשתמש:', err);
        this.snackBar.open('שגיאה בשליפת קורסי המשתמש', 'סגור', { duration: 3000 });
        return of([]);
      })
    ).subscribe(courses => {
      const ids = new Set(courses.map(c => c.id));
      this.userCourses.set(ids);
    });
  }

  loadTeacherNames(courses: Course[]) {
    const teacherIds = [...new Set(courses.map(course => course.teacherId))];
    const teacherRequests = teacherIds.map(id =>
      this.userService.getUser(id).pipe(
        catchError(err => {
          console.error(`שגיאה בשליפת פרטי מורה ID: ${id}`, err);
          return of(null);
        })
      )
    );

    if (teacherRequests.length > 0) {
      forkJoin(teacherRequests).pipe(takeUntil(this.destroy$)).subscribe(users => {
        const namesMap = new Map<number, string>();
        users.forEach(user => {
          if (user) {
            namesMap.set(user.id, user.name);
          }
        });
        this.teacherNames.set(namesMap);
      });
    }
  }

  getTeacherName(teacherId: number): string {
    return this.teacherNames().get(teacherId) || 'מורה לא ידוע';
  }

  isEnrolled(courseId: number): boolean {
    return this.userCourses().has(courseId);
  }

  toggleEnrollment(course: Course) {
    const userId = this.user()?.id;
    if (!userId) {
      this.snackBar.open('יש להתחבר כדי להירשם/לבטל הרשמה לקורס', 'סגור', { duration: 3000 });
      return;
    }

    const enrolled = this.isEnrolled(course.id);
    const action = enrolled
      ? unenrollUserFromCourse({ userId, courseId: course.id })
      : enrollUserInCourse({ userId, courseId: course.id });

    this.store.dispatch(action);

    const updated = new Set(this.userCourses());
    if (enrolled) {
      updated.delete(course.id);
      this.snackBar.open('ההרשמה בוטלה בהצלחה!', 'סגור', { duration: 2000, panelClass: ['snackbar-success'] });
    } else {
      updated.add(course.id);
      this.snackBar.open('נרשמת לקורס בהצלחה!', 'סגור', { duration: 2000, panelClass: ['snackbar-success'] });
    }
    this.userCourses.set(updated);
  }

  navigateToCourseDetails(course: Course) {
    this.router.navigate(['/courses', course.id]);
  }

  navigateToCourseManagement() {
    this.router.navigate(['/course-management']);
  }

  private getRandomTechIcon(): string {
    const randomIndex = Math.floor(Math.random() * this.techIcons.length);
    return this.techIcons[randomIndex];
  }

  getCardColor(index: number): string {
    const rStart = parseInt(this.cardBackgroundColorStart.substring(1, 3), 16);
    const gStart = parseInt(this.cardBackgroundColorStart.substring(3, 5), 16);
    const bStart = parseInt(this.cardBackgroundColorStart.substring(5, 7), 16);

    const rEnd = parseInt(this.cardBackgroundColorEnd.substring(1, 3), 16);
    const gEnd = parseInt(this.cardBackgroundColorEnd.substring(3, 5), 16);
    const bEnd = parseInt(this.cardBackgroundColorEnd.substring(5, 7), 16);

    const numCourses = this.allCourses().length;
    const ratio = numCourses > 1 ? index / (numCourses - 1) : 0;

    const r = Math.round(rStart + (rEnd - rStart) * ratio);
    const g = Math.round(gStart + (gEnd - gStart) * ratio);
    const b = Math.round(bStart + (bEnd - bStart) * ratio);

    return `rgb(${r}, ${g}, ${b})`;
  }

  // פונקציה לקביעת צבע טקסט בהתאם לצבע רקע
  getTextColor(backgroundColor: string): string {
    // מזהה אם הצבע הוא RGB או HEX
    let r, g, b;
    if (backgroundColor.startsWith('rgb')) {
      const colors = backgroundColor.match(/\d+/g)?.map(Number);
      if (colors && colors.length >= 3) {
        [r, g, b] = colors;
      } else {
        return '#000000'; // ברירת מחדל אם משהו השתבש
      }
    } else { // assume hex
      const hex = backgroundColor.startsWith('#') ? backgroundColor.substring(1) : backgroundColor;
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // חישוב בהירות (Luminance) באמצעות פורמולה נפוצה
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF'; // אם בהיר - שחור, אם כהה - לבן
  }
}