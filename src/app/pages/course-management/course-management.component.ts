import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../services/courses.service';
import { Course } from '../../models/course.model';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store, select } from '@ngrx/store';
import { selectCurrentUser } from '../../stores/user/user.selectors';
import { AddEditCourseComponent } from '../add-edit-course/add-edit-course.component'; // ודא שהנתיב נכון

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    // RouterLink,
    MatProgressSpinnerModule,
  ],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.css'
})
export class CourseManagementComponent implements OnInit {
  private courseService = inject(CourseService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private store = inject(Store);

  displayedColumns: string[] = ['id', 'title', 'description', 'actions'];
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(true);
  teacherId = signal<number | null>(null);

  ngOnInit(): void {
    this.store.pipe(select(selectCurrentUser)).subscribe(user => {
      this.teacherId.set(user?.id || null);
      if (this.teacherId() !== null) {
        this.loadAllCoursesAndFilter();
      }
    });
  }

  loadAllCoursesAndFilter() {
    this.isLoading.set(true);
    const currentTeacherId = this.teacherId();

    if (currentTeacherId !== null) {
      this.courseService.getAllCourses().subscribe({
        next: (allCourses) => {
          const teacherCourses = allCourses.filter(course => course.teacherId === currentTeacherId);
          this.courses.set(teacherCourses);
        },
        error: (err) => {
          console.error('שגיאה בטעינת כל הקורסים:', err);
          this.snackBar.open('שגיאה בטעינת הקורסים', 'סגור', { duration: 3000 });
        },
        complete: () => this.isLoading.set(false)
      });
    } else {
      console.error('שגיאה: ID מורה לא זמין.');
      this.snackBar.open('שגיאה: פרטי מורה לא זמינים', 'סגור', { duration: 3000 });
      this.isLoading.set(false);
    }
  }

  addCourse() {
    const dialogRef = this.dialog.open(AddEditCourseComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCoursesAndFilter(); // רענון רשימת הקורסים
      }
    });
  }

  editCourse(course: Course) {
    const dialogRef = this.dialog.open(AddEditCourseComponent, {
      data: { course } // העברת נתוני הקורס לדיאלוג
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCoursesAndFilter(); // רענון רשימת הקורסים לאחר עריכה
      }
    });
  }

  deleteCourse(courseId: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק את הקורס הזה?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.snackBar.open('הקורס נמחק בהצלחה', 'סגור', { duration: 3000 });
          this.loadAllCoursesAndFilter();
        },
        error: (err) => {
          console.error('שגיאה במחיקת קורס:', err);
          this.snackBar.open('שגיאה במחיקת הקורס', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  goBackToCourses() {
    this.router.navigate(['/courses']);
  }
}