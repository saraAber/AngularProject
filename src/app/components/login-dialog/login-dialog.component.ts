import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import * as UserSelectors from '../../stores/user/user.selectors';
import * as UserActions from '../../stores/user/user.actions';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // וודא שזה מיובא
import { takeUntil } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css'],
  animations: [
    trigger('fadeIn', [ // שיניתי את שם האנימציה מ-'fade' ל-'fadeIn' כדי להתאים ל-HTML
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule, // וודא שזה מופיע כאן
    AsyncPipe,
  ]
})
export class LoginDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('nameField') nameField!: ElementRef;
  @ViewChild('emailField') emailField!: ElementRef;
  @ViewChild('passwordField') passwordField!: ElementRef;

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
  hidePassword = true;
  submitBtnDisabled = true;
  authForm!: FormGroup;
  error$!: Observable<string | null>;
  loading$!: Observable<boolean>;

  ngOnInit(): void {
    this.initForm();

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

          setTimeout(() => {
            this.dialogRef.close();
          }, 1500);

          this.cdr.detectChanges();
        }
      });

    // Listen for errors
    this.error$ = this.store.select(UserSelectors.selectUserError);
    this.loading$ = this.store.select(UserSelectors.selectUserLoading); // כאן מוגדר ה-loading$
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

  ngAfterViewInit(): void {
    // קוד זה מנסה לשנות את כיווניות השדות לאחר ה-render.
    // ייתכן שחלק מזה כבר מטופל על ידי CSS גלובלי או הגדרות Angular Material.
    // אם יש בעיות כיווניות, כדאי לבדוק את סדר העדיפויות של ה-CSS.
    const formFields = document.querySelectorAll('.mat-mdc-form-field');
    formFields.forEach(field => {
      field.setAttribute('dir', 'rtl');
      const input = field.querySelector('input');
      if (input) {
        input.setAttribute('dir', 'ltr');
      }
    });

    const formFields2 = document.querySelectorAll('.mat-form-field');
    formFields2.forEach(field => {
      field.setAttribute('dir', 'rtl');
      const input = field.querySelector('input');
      if (input) {
        input.setAttribute('dir', 'ltr');
      }
    });
  }

  private initForm(): void {
    this.authForm = this.fb.group({
      name: ['', this.isLogin ? null : [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.authForm.valueChanges.subscribe(() => {
      const emailControl = this.authForm.get('email');
      const passwordControl = this.authForm.get('password');

      if (emailControl?.valid && passwordControl?.valid) {
        this.submitBtnDisabled = false;
      } else {
        this.submitBtnDisabled = true;
      }

      setTimeout(() => {
        const formFields = document.querySelectorAll('.mat-mdc-form-field');
        formFields.forEach(field => {
          const controlName = field.getAttribute('formcontrolname');
          if (controlName) {
            const control = this.authForm.get(controlName);
            if (control && control.invalid && control.touched) {
              field.classList.add('invalid-field');
            } else {
              field.classList.remove('invalid-field');
            }
          }
        });
      });
    });
  }

  submit(): void {
    if (this.authForm.invalid) {
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
      this.store.dispatch(UserActions.registerUser({ name, email, password, role: 'student' }));
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
