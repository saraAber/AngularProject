import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../stores/user/user.selectors';
import * as UserActions from '../../stores/user/user.actions';
import { Observable, Subject, takeUntil, map } from 'rxjs';
import { User } from '../../stores/user/user.state';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink,
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null> = this.store.select(UserSelectors.selectCurrentUser);
  isLoggedIn$: Observable<boolean> = this.store.select(UserSelectors.selectCurrentUser).pipe(
    takeUntil(this.destroy$),
    map(user => !!user)
  );
  isLoggedOut$: Observable<boolean> = this.isLoggedIn$.pipe( // Added this line
    map(loggedIn => !loggedIn)
  );
  loggedInUserName: string | null = null;

  ngOnInit(): void {
    this.store.select(UserSelectors.selectCurrentUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.loggedInUserName = user?.name || null;
      });
  }

  openLoginPopup(): void {
    this.dialog.open(LoginDialogComponent, {
      width: '400px',
      data: { isLogin: true }
    });
  }

  logout(): void {
    this.store.dispatch(UserActions.logoutUser());
    localStorage.removeItem('authToken');
    // this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}