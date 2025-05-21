import { Component, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { Store } from '@ngrx/store';
import * as UserSelectors from '../../stores/user/user.selectors';
import * as UserActions from '../../stores/user/user.actions';
import { Observable, Subject, takeUntil, map } from 'rxjs';
import { User } from '../../stores/user/user.state';
import { AsyncPipe } from '@angular/common';
import { FirstLetterPipe } from "../../pipes/first-letter.pipe";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    FirstLetterPipe
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleSidenav = new EventEmitter<void>();

  private dialog = inject(MatDialog);
  private store = inject(Store);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<User | null> = this.store.select(UserSelectors.selectCurrentUser);
  isLoggedIn$: Observable<boolean> = this.store.select(UserSelectors.selectCurrentUser).pipe(
    takeUntil(this.destroy$),
    map(user => !!user)
  );
  isLoggedOut$: Observable<boolean> = this.isLoggedIn$.pipe(
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}