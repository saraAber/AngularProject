import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { CourseDetailsComponent } from './pages/course-details/course-details.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { AboutComponent } from './pages/about/about.component';
import { AddCourseDialogComponent } from './pages/add-course-dialog/add-course-dialog.component';

export const routes: Routes = [{ path: '', component: HomeComponent, pathMatch: 'full' }, // דף הבית
    { path: 'courses', component: CoursesComponent }, // רשימת קורסים
    { path: 'courses/:id', component: CourseDetailsComponent }, // פרטי קורס ספציפי
    { path: 'course-management', component: CourseManagementComponent}, // ניהול קורסים (למורים)
    { path: 'add-course', component: AddCourseDialogComponent}, // ניהול קורסים (למורים)
    { path: 'about', component: AboutComponent}, // ניהול קורסים (למורים)
    { path: '**', component: NotFoundComponent } // כל כתובת לא תקינה מפנה לדף הבית
     ];


     