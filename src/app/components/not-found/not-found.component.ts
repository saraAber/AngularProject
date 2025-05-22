// src/app/components/not-found/not-found.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // נדרש לשימוש ב-Angular directives כמו *ngIf, *ngFor
import { MatIconModule } from '@angular/material/icon'; // נדרש לאייקונים של Material Design
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true, // ודא שזה true אם הקומפוננטה היא standalone
  imports: [
    CommonModule, // לייבוא CommonModule
    MatIconModule, // לייבוא MatIconModule
  RouterLink
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent {
  // נתוני אייקונים לשובבות
  funIcons = [
    'build', 'settings_ethernet', 'construction', 'bug_report', 'science', 'psychology'
  ];

  // אפשרות להוסיף לוגיקה כלשהי אם תרצה, למשל, לוגיקה של ניווט בחזרה
  constructor() { }
}