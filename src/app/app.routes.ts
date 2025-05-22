import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CoursesComponent } from './components/courses/courses.component';
import { CourseDetailsComponent } from './components/course-details/course-details.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [{ path: '', component: HomeComponent, pathMatch: 'full' }, 
    { path: 'home', component: HomeComponent }, 
    { path: 'courses', component: CoursesComponent }, 
    { path: 'courses/:id', component: CourseDetailsComponent }, 
    { path: 'course-management', component: CourseManagementComponent}, 
    { path: 'about', component: NotFoundComponent},
    { path: '**', component: NotFoundComponent } 
     ];


     