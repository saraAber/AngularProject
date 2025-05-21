import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators'; // Import switchMap
import * as UserActions from './user.actions';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { User } from './user.state';

@Injectable()
export class UserEffects {

  private actions$ = inject(Actions);
  private userService = inject(UserService);
  private router = inject(Router);

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.registerUser),
      mergeMap((action) => {
        console.log('Register User Action:', action);
        return this.userService.registerUser(action.name, action.email, action.password, action.role).pipe(
          tap((response) => {
            localStorage.setItem('token', response.token);
            console.log('Saved token:', response.token);
          }),
          map((response) => {
            console.log('Register User Success Response:', response);
            const user: User = {
              id: response.userId,
              name: action.name,
              email: action.email,
              role: response.role,
              courseIds: []
            };
            return UserActions.registerUserSuccess({ user, token: response.token });
          }),
          catchError((error) => {
            console.error('Register User Failure Error:', error);
            let errorMessage = 'ההרשמה נכשלה.';
            if (error?.error?.message?.includes('E11000 duplicate key')) {
              errorMessage = 'כתובת האימייל כבר רשומה במערכת.';
            } else if (error?.status === 400) {
              errorMessage = 'אחד או יותר מהפרטים שהוזנו אינם תקינים.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.registerUserFailure({ error: errorMessage }));
          })
        );
      }),
      tap(() => this.router.navigate(['/courses']))
    )
  );
  

  loginUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loginUser),
      switchMap((action) => {
        console.log('Login User Action:', action);
        return this.userService.loginUser(action.email, action.password).pipe(
          tap((response) => {
            localStorage.setItem('token', response.token);
            console.log('Saved token:', response.token);
          }),
          map((response) => {
            console.log('Login User Success Response:', response);
            return UserActions.loadUser({ userId: response.userId });
          }),
          catchError((error) => {
            console.error('Login User Failure Error:', error);
            let errorMessage = 'הכניסה נכשלה.';
            if (error?.status === 401) {
              errorMessage = 'שם המשתמש או הסיסמה שגויים.';
            } else if (error?.status === 404) {
              errorMessage = 'המשתמש לא נמצא.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.loginUserFailure({ error: errorMessage }));
          })
        );
      })
    )
  );
  
logOutUser$=createEffect(()=>
this.actions$.pipe(
    ofType(UserActions.logoutUser),
    tap(()=>{
        localStorage.clear();
    })
    
),
{ dispatch: false }
)

  // loadUser$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(UserActions.loadUser),
  //     switchMap((action) => {
  //       console.log('Load User Action:', action);
  //       return this.userService.getUser(action.userId).pipe(
  //         map((user) => {
  //           console.log('Load User Success Response:', user);
  //           return UserActions.loadUserSuccess({ user });
  //         }),
  //         catchError((error) => {
  //           console.error('Load User Failure Error:', error);
  //           let errorMessage = 'טעינת פרטי המשתמש נכשלה.';
  //           if (error?.status === 404) {
  //             errorMessage = 'המשתמש לא נמצא.';
  //           } else if (error?.status === 500) {
  //             errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
  //           }
  //           return of(UserActions.loadUserFailure({ error: errorMessage }));
  //         })
  //       );
  //     })
  //   )
  // );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap((action) => {
        console.log('Load User Action:', action);
        return this.userService.getUser(action.userId).pipe(
          mergeMap((user) => [ // השתמש ב-mergeMap כדי לשגר מספר פעולות
            UserActions.loadUserSuccess({ user }),
            UserActions.loadUserCourses({ userId: user.id })
          ]),
          catchError((error) => {
            console.error('Load User Failure Error:', error);
            let errorMessage = 'טעינת פרטי המשתמש נכשלה.';
            if (error?.status === 404) {
              errorMessage = 'המשתמש לא נמצא.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.loadUserFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  loadUserCourses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserCourses),
      switchMap((action) => {
        console.log('Load User Courses Action:', action);
        return this.userService.getUserCourses(action.userId).pipe( // צור מתודה כזו בשירות שלך
          map((courseIds: number[]) => {
            console.log('Load User Courses Success Response:', courseIds);
            return UserActions.loadUserCoursesSuccess({ userId: action.userId, courseIds });
          }),
          catchError((error) => {
            console.error('Load User Courses Failure Error:', error);
            let errorMessage = 'טעינת קורסי המשתמש נכשלה.';
            if (error?.status === 404) {
              errorMessage = 'המשתמש לא נמצא או שאין לו קורסים.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת בעת טעינת קורסי המשתמש.';
            }
            return of(UserActions.loadUserCoursesFailure({ error: errorMessage }));
          })
        );
      })
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap((action) =>
        this.userService.updateUser(action.userId, action.user).pipe(
          map((response) => UserActions.updateUserSuccess({ user: response.user })),
          catchError((error) => {
            let errorMessage = 'עדכון פרטי המשתמש נכשל.';
            if (error?.status === 400) {
              errorMessage = 'אחד או יותר מהפרטים שהוזנו אינם תקינים.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.updateUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.deleteUser),
      mergeMap((action) =>
        this.userService.deleteUser(action.userId).pipe(
          map(() => UserActions.deleteUserSuccess({ userId: action.userId })),
          catchError((error) => {
            let errorMessage = 'מחיקת המשתמש נכשלה.';
            if (error?.status === 404) {
              errorMessage = 'המשתמש לא נמצא.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.deleteUserFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  enrollUserInCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.enrollUserInCourse),
      mergeMap(action =>
        this.userService.enrollUserInCourse(action.userId, action.courseId).pipe(
          map(() => UserActions.enrollUserInCourseSuccess({ userId: action.userId, courseId: action.courseId })),
          catchError((error) => {
            let errorMessage = 'ההרשמה לקורס נכשלה.';
            if (error?.status === 404) {
              errorMessage = 'המשתמש או הקורס לא נמצאו.';
            } else if (error?.status === 409) {
              errorMessage = 'המשתמש כבר רשום לקורס זה.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.enrollUserInCourseFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  unenrollUserFromCourse$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.unenrollUserFromCourse),
      mergeMap(action =>
        this.userService.unenrollUserFromCourse(action.userId, action.courseId).pipe(
          map(() => UserActions.unenrollUserFromCourseSuccess({ userId: action.userId, courseId: action.courseId })),
          catchError((error) => {
            let errorMessage = 'הסרת הרישום מהקורס נכשלה.';
            if (error?.status === 404) {
              errorMessage = 'המשתמש או הקורס לא נמצאו.';
            } else if (error?.status === 500) {
              errorMessage = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר.';
            }
            return of(UserActions.unenrollUserFromCourseFailure({ error: errorMessage }));
          })
        )
      )
    )
  );
}