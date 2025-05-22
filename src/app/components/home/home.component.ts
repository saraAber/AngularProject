import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Store, select } from '@ngrx/store';
import { selectCurrentUser } from '../../stores/user/user.selectors'; // ודא שהנתיב נכון ל-user.selectors שלך
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { takeUntil }
 from 'rxjs/operators';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('homeContentAnimation', [
      transition(':enter', [
        query('.welcome-message, .tech-cube', [
          style({ opacity: 0, transform: 'translateY(20px)' })
        ], { optional: true }),
        query('.welcome-message', [
          animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ], { optional: true }),
        query('.tech-cube', [
          stagger('100ms', [
            animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  currentUser = toSignal(this.store.pipe(select(selectCurrentUser), takeUntil(this.destroy$)), { initialValue: null });

  userName = computed(() => {
    const user = this.currentUser();
    return user ? user.name : 'אורח';
  });

  // אייקונים לדוגמה שקשורים להייטק
  techIcons = [
    { name: 'code', label: 'פיתוח' },
    { name: 'cloud', label: 'ענן' },
    { name: 'security', label: 'אבטחת מידע' },
    { name: 'analytics', label: 'דאטה' },
  ];

  ngOnInit(): void {
    // אין צורך בלוגיקה נוספת כאן עבור האזנה לשינויים,
    // מכיוון ש-toSignal ו-computed מטפלים בזה באופן ריאקטיבי.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}