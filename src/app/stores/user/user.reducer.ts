import { createReducer, on } from '@ngrx/store';
   import { initialState, userAdapter, UserState } from './user.state';
   import *as UserActions from './user.actions';
import { state } from '@angular/animations';
   
   export const userReducer = createReducer(
     initialState,
     on(UserActions.registerUser, (state) => ({ ...state, loading: true, error: null })),
     on(UserActions.registerUserSuccess, (state, { user, token }) => userAdapter.setOne(user, { ...state, loading: false, error: null, token: token })),
     on(UserActions.registerUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
     
     on(UserActions.loginUser, (state) => ({ ...state, loading: true, error: null })),
     on(UserActions.loginUserSuccess, (state, { user, token }) => userAdapter.setOne(user, { ...state, loading: false, error: null, token: token })),
     on(UserActions.loginUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
   
     on(UserActions.loadUser, (state) => ({ ...state, loading: true, error: null })),
     on(UserActions.loadUserSuccess, (state, { user }) => userAdapter.setOne(user, { ...state, loading: false, error: null })),
     on(UserActions.loadUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
   
     on(UserActions.loadUserCourses, (state) => ({ ...state, coursesLoading: true, coursesError: null })),
     on(UserActions.loadUserCoursesSuccess, (state, { userId, courseIds }) => {
       const entity = state.entities[userId];
       if (entity) {
         return userAdapter.updateOne({ id: userId, changes: { courseIds } }, { ...state, coursesLoading: false, coursesError: null });
       }
       return { ...state, coursesLoading: false, coursesError: 'משתמש לא נמצא בעת עדכון קורסים.' };
     }),
     on(UserActions.loadUserCoursesFailure, (state, { error }) => ({ ...state, coursesLoading: false, coursesError: error })),

     on(UserActions.updateUser, (state) => ({ ...state, loading: true, error: null })),
     on(UserActions.updateUserSuccess, (state, { user }) => userAdapter.updateOne({ id: user.id, changes: user }, { ...state, loading: false, error: null })),
     on(UserActions.updateUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
   
     on(UserActions.deleteUser, (state) => ({ ...state, loading: true, error: null })),
     on(UserActions.deleteUserSuccess, (state, { userId }) => userAdapter.removeOne(userId, state)),
     on(UserActions.deleteUserFailure, (state, { error }) => ({ ...state, loading: false, error })),
   
     on(UserActions.clearUsers, (state) => userAdapter.removeAll(state)),
     //אני רוצה להגביר שבעת התנתקות משתמש ימחק הטוקן מהלוקל סטורייג
     on(UserActions.logoutUser, (state) => ({...initialState})),
     on(UserActions.enrollUserInCourseSuccess, (state, { userId, courseId }) => {
      return userAdapter.updateOne({
        id: userId,
        changes: {
          courseIds: [...(state.entities[userId]?.courseIds || []), courseId]
        }
      }, state);
     }),
     on(UserActions.enrollUserInCourseFailure, (state, { error }) => ({ ...state, coursesError: error })),
     
     on(UserActions.unenrollUserFromCourseSuccess, (state, { userId, courseId }) => {
      return userAdapter.updateOne({
        id: userId,
        changes: {
          courseIds: (state.entities[userId]?.courseIds || []).filter(id => id !== courseId)
        }
      }, state);
     }),
     on(UserActions.unenrollUserFromCourseFailure, (state, { error }) => ({ ...state, coursesError: error })),
     on(UserActions.clearUserError, (state) => ({ ...state, error: null })),
    //  on(UserActions.putCoursesId,(state,{userId})=>({...state,}))
    );