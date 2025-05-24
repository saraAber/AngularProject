
// src/app/components/course-management/course-management.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CourseService } from '../../services/courses.service';
import { Course } from '../../models/course.model';
import { Router } from '@angular/router'; // RouterLink כבר לא בשימוש ישירות ב-HTML זה, לכן רק Router מספיק
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store, select } from '@ngrx/store';
import { selectCurrentUser } from '../../stores/user/user.selectors';
import { AddEditCourseComponent } from '../add-edit-course/add-edit-course.component';
import { CommonModule } from '@angular/common'; // הוסף CommonModule
import { MatTooltipModule } from '@angular/material/tooltip'; // הוסף MatTooltipModule

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule, // חשוב עבור @if וכו'
    MatTooltipModule, // עבור matTooltip
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

  // עדכן את displayedColumns - הסר את 'id'
  displayedColumns: string[] = ['title', 'description', 'actions'];
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(true);
  teacherId = signal<number | null>(null);

  // מפת אייקונים שתשמש כדי לתת אייקון קבוע לכל קורס
  private courseIcons = new Map<number, string>();
  // רשימת אייקוני טכנולוגיה פוטנציאליים
  readonly techIcons = [
    'code', 'laptop_mac', 'data_object', 'cloud', 'terminal', 'devices',
    'storage', 'developer_mode', 'dns', 'security', 'analytics', 'memory',
    'build', 'insights', 'robot', 'bug_report', 'science', 'settings_ethernet',
    'web', 'auto_awesome', 'palette', 'school', 'emoji_objects', 'psychology'
  ];

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
          // כאשר טוענים את הקורסים, נדאג להגדיר להם אייקונים
          teacherCourses.forEach(course => {
            if (!this.courseIcons.has(course.id)) {
              this.courseIcons.set(course.id, this.getRandomTechIcon());
            }
          });
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
    const dialogRef = this.dialog.open(AddEditCourseComponent, {
      width: '600px', // רוחב סטנדרטי התחלתי
      height: 'auto', // גובה אוטומטי
      panelClass: 'add-edit-course-dialog' // קלאס מותאם אישית לעיצוב הדיאלוג
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCoursesAndFilter();
      }
    });
  }

  editCourse(course: Course) {
    const dialogRef = this.dialog.open(AddEditCourseComponent, {
      data: { course },
      width: '600px', // רוחב סטנדרטי התחלתי
      height: 'auto', // גובה אוטומטי
      panelClass: 'add-edit-course-dialog' // קלאס מותאם אישית לעיצוב הדיאלוג
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadAllCoursesAndFilter();
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
 private rowColors: string[] = [
    '#e0f2f7', // טורקיז בהיר מאוד
    '#d1f1f2',
    '#c2efed',
    '#b3ede8',
    '#a4ede3'  // ירוק-טורקיז קצת יותר כהה
  ];

  getCourseRowBackground(index: number): string {
    // מחזיר צבע מתוך המערך בהתאם לאינדקס של השורה, במחזוריות
    return this.rowColors[index % this.rowColors.length];
  }

  // פונקציה חדשה לקבלת אייקון עבור קורס
  getCourseIcon(courseId: number): string {
    return this.courseIcons.get(courseId) || 'school'; // אם אין אייקון, תן ברירת מחדל
  }

  // פונקציה חדשה לבחירת אייקון אקראי
  private getRandomTechIcon(): string {
    const randomIndex = Math.floor(Math.random() * this.techIcons.length);
    return this.techIcons[randomIndex];
  }
}