// import { Component, inject, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
// import { MatDialogRef } from '@angular/material/dialog';
// import { MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { Course } from '../../models/course.model';
// import { CourseService } from '../../services/courses.service';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { Lesson } from '../../models/lesson.model';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { LessonService } from '../../services/lesson.service';
// import { Store, select } from '@ngrx/store';
// import { selectCurrentUser } from '../../stores/user/user.selectors';
// import { User } from '../../stores/user/user.state';
// import { forkJoin, Observable } from 'rxjs';

// interface AddEditCourseData {
//   course?: Course;
// }

// @Component({
//   selector: 'app-add-edit-course',
//   standalone: true,
//   imports: [
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatIconModule,
//     CommonModule,
//   ],
//   templateUrl: './add-edit-course.component.html',
//   styleUrl: './add-edit-course.component.css'
// })
// export class AddEditCourseComponent implements OnInit {
//   form: FormGroup;
//   isEditMode = false;
//   courseId: number | null = null;
//   private lessonService = inject(LessonService);
//   private store = inject(Store);
//   teacherId: number | null = null;
//   public dialogRef = inject(MatDialogRef<AddEditCourseComponent>);
//   public data: AddEditCourseData = inject(MAT_DIALOG_DATA);

//   constructor(
//     private fb: FormBuilder,
//     private courseService: CourseService,
//     private snackBar: MatSnackBar,
//   ) {
//     this.form = this.fb.group({
//       title: ['', Validators.required],
//       description: [''],
//       lessons: this.fb.array([])
//     });
//   }

//   ngOnInit(): void {
//     this.store.pipe(select(selectCurrentUser)).subscribe(user => {
//       this.teacherId = user?.id || null;
//     });

//     if (this.data?.course) {
//       this.isEditMode = true;
//       this.courseId = this.data.course.id;
//       this.form.patchValue({
//         title: this.data.course.title,
//         description: this.data.course.description
//       });
//       this.loadCourseLessons();
//     }
//   }

//   get lessonsFormArray() {
//     return this.form.controls['lessons'] as FormArray;
//   }

//   loadCourseLessons() {
//     if (this.courseId) {
//       this.lessonService.getLessonsByCourseId(this.courseId).subscribe({
//         next: (lessons) => {
//           this.lessonsFormArray.clear();
//           lessons.forEach(lesson => {
//             this.lessonsFormArray.push(this.fb.group({
//               id: [lesson.id],
//               title: [lesson.title, Validators.required],
//               content: [lesson.content]
//             }));
//           });
//         },
//         error: (error) => {
//           console.error('שגיאה בטעינת שיעורים:', error);
//           this.snackBar.open('שגיאה בטעינת שיעורים', 'סגור', { duration: 3000 });
//         }
//       });
//     }
//   }

//   addLesson() {
//     this.lessonsFormArray.push(this.fb.group({
//       title: ['', Validators.required],
//       content: ['']
//     }));
//   }

//   removeLesson(index: number) {
//     this.lessonsFormArray.removeAt(index);
//   }

//   onSubmit() {
//     console.log("onSubmit");

//     if (this.form.valid && this.teacherId !== null) {
//       const courseData = this.form.value;

//       if (this.isEditMode && this.courseId !== null) {
//         this.updateCourse(courseData);
//       } else {
//         this.createCourse(courseData);
//       }
//     } else if (!this.teacherId) {
//       console.error('שגיאה: ID מורה לא זמין מהסטור.');
//       this.snackBar.open('שגיאה: לא ניתן לשמור קורס ללא פרטי מורה.', 'סגור', { duration: 3000 });
//     }
//   }

//   createCourse(courseData: Course) {
//     this.courseService.createCourse({
//       title: courseData.title!,
//       description: courseData.description!,
//       teacherId: this.teacherId!
//     }).subscribe({
//       next: (newCourse) => {
//         this.snackBar.open('הקורס נוצר בהצלחה, כעת יוצרים שיעורים...', 'סגור', { duration: 3000 });
//         const lessons = courseData.lessons;
//         if (lessons && lessons.length > 0) {
//           const createLessonObservables: Observable<Lesson>[] = lessons.map(lesson =>
//             this.lessonService.createLesson(newCourse.id, { title: lesson.title, content: lesson.content, courseId: newCourse.id })
//           );
//           forkJoin(createLessonObservables).subscribe({
//             next: (newLessons) => {
//               console.log('כל השיעורים נוצרו בהצלחה', newLessons);
//               this.snackBar.open('הקורס והשיעורים נוספו בהצלחה', 'סגור', { duration: 3000 });
//               this.dialogRef.close(newCourse);
//             },
//             error: (error) => {
//               console.error('שגיאה ביצירת שיעורים:', error);
//               this.snackBar.open('שגיאה ביצירת השיעורים', 'סגור', { duration: 3000 });
//               this.dialogRef.close(null); // סגור עם ערך שגיאה
//             }
//           });
//         } else {
//           this.snackBar.open('הקורס נוסף בהצלחה ללא שיעורים', 'סגור', { duration: 3000 });
//           this.dialogRef.close(newCourse);
//         }
//       },
//       error: (error) => {
//         console.error('שגיאה בהוספת הקורס:', error);
//         this.snackBar.open('שגיאה בהוספת הקורס', 'סגור', { duration: 3000 });
//         this.dialogRef.close(null); // סגור עם ערך שגיאה
//       }
//     });
//   }

//   updateCourse(courseData: any) {
//     if (this.teacherId !== null) {
//       this.courseService.updateCourse(this.courseId!, {
//         title: courseData.title,
//         description: courseData.description,
//         teacherId: this.teacherId
//       }).subscribe({
//         next: (updatedCourse) => {
//           this.snackBar.open('הקורס עודכן בהצלחה, כעת מעדכנים שיעורים...', 'סגור', { duration: 3000 });
//           this.updateCourseLessons();
//         },
//         error: (error) => {
//           console.error('שגיאה בעדכון הקורס:', error);
//           this.snackBar.open('שגיאה בעדכון הקורס', 'סגור', { duration: 3000 });
//         }
//       });
//     } else {
//       console.error('שגיאה: ID מורה לא זמין בעת עדכון קורס.');
//       this.snackBar.open('שגיאה: לא ניתן לעדכן קורס ללא פרטי מורה.', 'סגור', { duration: 3000 });
//     }
//   }
//   updateCourseLessons() {
//     const lessonUpdates$: Observable<Lesson>[] = [];
//     const newLessons$: Observable<Lesson>[] = [];
//     const lessonsToDelete: number[] = [];

//     const originalLessons = this.data?.course?.lessons || [];
//     const currentLessonIds = this.lessonsFormArray.controls.map(control => control.value.id).filter(id => id !== undefined);

//     originalLessons.forEach(lesson => {
//       if (!currentLessonIds.includes(lesson.id)) {
//         lessonsToDelete.push(lesson.id);
//       }
//     });

//     this.lessonsFormArray.controls.forEach(lessonControl => {
//       const lesson = lessonControl.value;
//       const updatePayload: Partial<Omit<Lesson, 'id'>> = {
//         title: lesson.title,
//         content: lesson.content,
//           courseId:this.courseId!
//       };


//       if (lesson.id) {
//         console.log('שולח עדכון לשיעור:', lesson.id, updatePayload, this.courseId);
//         lessonUpdates$.push(this.lessonService.updateLesson(this.courseId!, lesson.id, updatePayload));
//       } else {
//         newLessons$.push(this.lessonService.createLesson(this.courseId!, { title: lesson.title, content: lesson.content, courseId: this.courseId! }));
//       }
//     });

//     const deleteLessons$: Observable<void>[] = lessonsToDelete.map(lessonId =>
//       this.lessonService.deleteLesson(this.courseId!, lessonId)
//     );

//     forkJoin([...lessonUpdates$, ...newLessons$, ...deleteLessons$]).subscribe({
//       next: (results) => {
//         console.log('כל השיעורים עודכנו/נוצרו/נמחקו בהצלחה', results);
//         this.snackBar.open('השיעורים עודכנו בהצלחה', 'סגור', { duration: 3000 });
//         this.dialogRef.close(true);
//       },
//       error: (error) => {
//         console.error('שגיאה בעדכון/יצירת/מחיקת שיעורים:', error);
//         this.snackBar.open('שגיאה בעדכון השיעורים', 'סגור', { duration: 3000 });
//         this.dialogRef.close(false);
//       }
//     });
//   }

//   onCancelClick(): void {
//     this.dialogRef.close();
//   }
// }


import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/courses.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Lesson } from '../../models/lesson.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LessonService } from '../../services/lesson.service';
import { Store, select } from '@ngrx/store';
import { selectCurrentUser } from '../../stores/user/user.selectors';
import { User } from '../../stores/user/user.state';
import { forkJoin, Observable } from 'rxjs';

interface AddEditCourseData {
  course?: Course;
}

@Component({
  selector: 'app-add-edit-course',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    CommonModule,
  ],
  templateUrl: './add-edit-course.component.html',
  styleUrl: './add-edit-course.component.css'
})
export class AddEditCourseComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  courseId: number | null = null;
  private lessonService = inject(LessonService);
  private store = inject(Store);
  teacherId: number | null = null;
  public dialogRef = inject(MatDialogRef<AddEditCourseComponent>);
  public data: AddEditCourseData = inject(MAT_DIALOG_DATA);

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      lessons: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.store.pipe(select(selectCurrentUser)).subscribe(user => {
      this.teacherId = user?.id || null;
    });

    if (this.data?.course) {
      this.isEditMode = true;
      this.courseId = this.data.course.id;
      this.form.patchValue({
        title: this.data.course.title,
        description: this.data.course.description
      });
      this.loadCourseLessons();
    }
  }

  get lessonsFormArray() {
    return this.form.controls['lessons'] as FormArray;
  }

  loadCourseLessons() {
    if (this.courseId) {
      this.lessonService.getLessonsByCourseId(this.courseId).subscribe({
        next: (lessons) => {
          this.lessonsFormArray.clear();
          lessons.forEach(lesson => {
            this.lessonsFormArray.push(this.fb.group({
              id: [lesson.id],
              title: [lesson.title, Validators.required],
              content: [lesson.content]
            }));
          });
        },
        error: (error) => {
          console.error('שגיאה בטעינת שיעורים:', error);
          this.snackBar.open('שגיאה בטעינת שיעורים', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  addLesson() {
    this.lessonsFormArray.push(this.fb.group({
      title: ['', Validators.required],
      content: ['']
    }));
  }

  removeLesson(index: number) {
    this.lessonsFormArray.removeAt(index);
  }

  onSubmit() {
    console.log("onSubmit");

    if (this.form.valid && this.teacherId !== null) {
      const courseData = this.form.value;

      if (this.isEditMode && this.courseId !== null) {
        this.updateCourse(courseData);
      } else {
        this.createCourse(courseData);
      }
    } else if (!this.teacherId) {
      console.error('שגיאה: ID מורה לא זמין מהסטור.');
      this.snackBar.open('שגיאה: לא ניתן לשמור קורס ללא פרטי מורה.', 'סגור', { duration: 3000 });
    }
  }
  createCourse(courseData: Course) {
    this.courseService.createCourse({
      title: courseData.title!,
      description: courseData.description!,
      teacherId: this.teacherId!
    }).subscribe({
      next: (newCourse: any) => { // שינוי הטיפוס ל-any כדי לאפשר גישה ל-courseId
        this.snackBar.open('הקורס נוצר בהצלחה, כעת יוצרים שיעורים...', 'סגור', { duration: 3000 });
        console.log('נתוני הקורס החדש שהתקבלו מהשרת:', newCourse);
        const lessons = courseData.lessons;
        if (lessons && lessons.length > 0) {
          const createLessonObservables: Observable<Lesson>[] = lessons.map(lesson => {
            console.log('יוצר שיעור עבור קורס ID:', newCourse.courseId);
            return this.lessonService.createLesson(newCourse.courseId, { title: lesson.title, content: lesson.content, courseId: newCourse.courseId });
          });
          forkJoin(createLessonObservables).subscribe({
            next: (newLessons) => {
              console.log('כל השיעורים נוצרו בהצלחה', newLessons);
              this.snackBar.open('הקורס והשיעורים נוספו בהצלחה', 'סגור', { duration: 3000 });
              this.dialogRef.close(newCourse);
            },
            error: (error) => {
              console.error('שגיאה ביצירת שיעורים:', error);
              this.snackBar.open('שגיאה ביצירת השיעורים', 'סגור', { duration: 3000 });
              this.dialogRef.close(null);
            }
          });
        } else {
          this.snackBar.open('הקורס נוסף בהצלחה ללא שיעורים', 'סגור', { duration: 3000 });
          this.dialogRef.close(newCourse);
        }
      },
      error: (error) => {
        console.error('שגיאה בהוספת הקורס:', error);
        this.snackBar.open('שגיאה בהוספת הקורס', 'סגור', { duration: 3000 });
        this.dialogRef.close(null);
      }
    });
  }

  updateCourse(courseData: any) {
    if (this.teacherId !== null) {
      this.courseService.updateCourse(this.courseId!, {
        title: courseData.title,
        description: courseData.description,
        teacherId: this.teacherId
      }).subscribe({
        next: (updatedCourse) => {
          this.snackBar.open('הקורס עודכן בהצלחה, כעת מעדכנים שיעורים...', 'סגור', { duration: 3000 });
          this.updateCourseLessons();
        },
        error: (error) => {
          console.error('שגיאה בעדכון הקורס:', error);
          this.snackBar.open('שגיאה בעדכון הקורס', 'סגור', { duration: 3000 });
        }
      });
    } else {
      console.error('שגיאה: ID מורה לא זמין בעת עדכון קורס.');
      this.snackBar.open('שגיאה: לא ניתן לעדכן קורס ללא פרטי מורה.', 'סגור', { duration: 3000 });
    }
  }
  updateCourseLessons() {
    const lessonUpdates$: Observable<Lesson>[] = [];
    const newLessons$: Observable<Lesson>[] = [];
    const lessonsToDelete: number[] = [];

    const originalLessons = this.data?.course?.lessons || [];
    const currentLessonIds = this.lessonsFormArray.controls.map(control => control.value.id).filter(id => id !== undefined);

    originalLessons.forEach(lesson => {
      if (!currentLessonIds.includes(lesson.id)) {
        lessonsToDelete.push(lesson.id);
      }
    });

    this.lessonsFormArray.controls.forEach(lessonControl => {
      const lesson = lessonControl.value;
      const updatePayload: Partial<Omit<Lesson, 'id'>> = {
        title: lesson.title,
        content: lesson.content,
        courseId: this.courseId!
      };


      if (lesson.id) {
        console.log('שולח עדכון לשיעור:', lesson.id, updatePayload, this.courseId);
        lessonUpdates$.push(this.lessonService.updateLesson(this.courseId!, lesson.id, updatePayload));
      } else {
        newLessons$.push(this.lessonService.createLesson(this.courseId!, { title: lesson.title, content: lesson.content, courseId: this.courseId! }));
      }
    });

    const deleteLessons$: Observable<void>[] = lessonsToDelete.map(lessonId =>
      this.lessonService.deleteLesson(this.courseId!, lessonId)
    );

    forkJoin([...lessonUpdates$, ...newLessons$, ...deleteLessons$]).subscribe({
      next: (results) => {
        console.log('כל השיעורים עודכנו/נוצרו/נמחקו בהצלחה', results);
        this.snackBar.open('השיעורים עודכנו בהצלחה', 'סגור', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('שגיאה בעדכון/יצירת/מחיקת שיעורים:', error);
        this.snackBar.open('שגיאה בעדכון השיעורים', 'סגור', { duration: 3000 });
        this.dialogRef.close(false);
      }
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}