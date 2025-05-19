import { createEntityAdapter, EntityState } from '@ngrx/entity';
   
   export interface User {
     id: number;
     name: string;
     email: string;
     role: string;
     courseIds: number[]; // Array of course IDs
   }
   
   export interface UserState extends EntityState<User> {
     loading: boolean;
     error: string | null;
     token: string | null;
     coursesLoading: boolean;
     coursesError: string | null;
   }
   
   export const userAdapter = createEntityAdapter<User>();
   
   export const initialState: UserState = userAdapter.getInitialState({
     loading: false,
     error: null,
     token: null,
     coursesLoading: false,
     coursesError: null,
   });
   
   export function selectUserId(user: User): number {
     return user.id;
   }