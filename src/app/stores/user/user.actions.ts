import { createAction, props } from '@ngrx/store';
import { User } from './user.state';
//import { Course } from '../course/course.state'; // Assuming you have a Course interface - Not needed anymore

export const registerUser = createAction(
  '[User] Register User',
  props<{ name: string; email: string; password: string; role: string }>()
);

export const registerUserSuccess = createAction(
  '[User] Register User Success',
  props<{ user: User; token: string }>()
);

export const registerUserFailure = createAction(
  '[User] Register User Failure',
  props<{ error: string }>()
);

export const loginUser = createAction(
  '[User] Login User',
  props<{ email: string; password: string }>()
);

export const loginUserSuccess = createAction(
  '[User] Login User Success',
  props<{ user: User; token: string }>()
);

export const loginUserFailure = createAction(
  '[User] Login User Failure',
  props<{ error: string }>()
);

export const loadUser = createAction(
  '[User] Load User',
  props<{ userId: number }>()
);

export const loadUserSuccess = createAction(
  '[User] Load User Success',
  props<{ user: User }>()
);

export const loadUserFailure = createAction(
  '[User] Load User Failure',
  props<{ error: string }>()
);

export const loadUserCourses = createAction(
  '[User] Load User Courses',
  props<{ userId: number }>()
);

export const loadUserCoursesSuccess = createAction(
  '[User] Load User Courses Success',
  props<{ userId: number; courseIds: number[] }>() // או אובייקט שמכיל את המשתמש עם הקורסים
);

export const loadUserCoursesFailure = createAction(
  '[User] Load User Courses Failure',
  props<{ error: string }>()
);

export const updateUser = createAction(
  '[User] Update User',
  props<{ userId: number; user: Partial<User> }>()
);

export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ user: User }>()
);

export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: string }>()
);

export const deleteUser = createAction(
  '[User] Delete User',
  props<{ userId: number }>()
);

export const deleteUserSuccess = createAction(
  '[User] Delete User Success',
  props<{ userId: number }>()
);

export const deleteUserFailure = createAction(
  '[User] Delete User Failure',
  props<{ error: string }>()
);

export const clearUsers = createAction(
  '[User] Clear Users'
);

export const logoutUser = createAction(
  '[User] Logout User'
);

export const enrollUserInCourse = createAction(
  '[User] Enroll User in Course',
  props<{ userId: number; courseId: number }>()
);

export const enrollUserInCourseSuccess = createAction(
  '[User] Enroll User in Course Success',
  props<{ userId: number; courseId: number }>()
);

export const enrollUserInCourseFailure = createAction(
  '[User] Enroll User in Course Failure',
  props<{ error: string }>()
);

export const unenrollUserFromCourse = createAction(
  '[User] Unenroll User from Course',
  props<{ userId: number; courseId: number }>()
);

export const unenrollUserFromCourseSuccess = createAction(
  '[User] Unenroll User from Course Success',
  props<{ userId: number; courseId: number }>()
);

export const unenrollUserFromCourseFailure = createAction(
  '[User] Unenroll User from Course Failure',
  props<{ error: string }>()
);

export const clearUserError = createAction('[User/API] Clear User Error');

// export const putCoursesId = createAction('[number[]] put coutes ids in User',
//   props<{userId: number}>()
// )