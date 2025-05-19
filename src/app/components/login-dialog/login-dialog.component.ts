import {
  Component,
  inject,
  ChangeDetectorRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  MatCardModule
} from '@angular/material/card';
import {
  MatFormFieldModule
} from '@angular/material/form-field';
import {
  MatInputModule
} from '@angular/material/input';
import {
  MatButtonModule
} from '@angular/material/button';
import {
  MatIconModule
} from '@angular/material/icon';
import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import {
  MatProgressSpinnerModule
} from '@angular/material/progress-spinner';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as UserActions from '../../stores/user/user.actions';
import * as UserSelectors from '../../stores/user/user.selectors';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    AsyncPipe
  ],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.css',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class LoginDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<LoginDialogComponent>);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  isLogin = true;
  showSuccessMessage = false;
  successMessage = '';
  userName: string | null = null;
  hidePassword = true; // Added this line to fix the template error

  authForm = this.fb.group({
    name: ['', this.isLogin ? [] : [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading$ = this.store.select(UserSelectors.selectUserLoading);
  error$ = this.store.select(UserSelectors.selectUserError);

  ngOnInit(): void {
    // Listen for successful user login/registration
    this.store
      .select(UserSelectors.selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user?.name) {
          this.userName = user.name;
          this.showSuccessMessage = true;
          this.successMessage = this.isLogin
            ? `ברוך הבא, ${this.userName}! התחברת בהצלחה`
            : `ברוך הבא ${this.userName}, נרשמת בהצלחה לאתר שלנו!`;
          
          this.snackBar.open(this.successMessage, 'סגור', {
            duration: 7000,
            direction: 'rtl',
            panelClass: ['success-snackbar']
          });
          
          // Allow the success message to display briefly before closing
          setTimeout(() => {
            this.dialogRef.close();
          }, 1500);
          
          this.cdr.detectChanges();
        }
      });
  
    // Listen for errors
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.snackBar.open(error, 'סגור', {
          duration: 5000,
          direction: 'rtl',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.authForm.controls).forEach(key => {
        const control = this.authForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.store.dispatch(UserActions.clearUserError()); 

    const name = this.authForm.get('name')?.value ?? '';
    const email = this.authForm.get('email')?.value;
    const password = this.authForm.get('password')?.value;

    if (!email || !password) return;

    if (this.isLogin) {
      this.store.dispatch(UserActions.loginUser({ email, password }));
    } else {
      this.store.dispatch(UserActions.registerUser({ name, email, password, role: 'teacher' }));
    }
  }

  toggleMode(): void {
    this.isLogin = !this.isLogin;
    const nameControl = this.authForm.get('name');

    if (nameControl) {
      if (this.isLogin) {
        nameControl.clearValidators();
      } else {
        nameControl.setValidators([Validators.required]);
      }
      nameControl.updateValueAndValidity();
    }

    this.showSuccessMessage = false;
    this.authForm.reset({
      name: '',
      email: '',
      password: ''
    });
    this.store.dispatch(UserActions.clearUserError());
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}