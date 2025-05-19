// ✅ Angular 19 - Http Interceptor בצורה פונקציונלית (חדש)

// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('token');
    console.log("i hir!");
    if (token) {
        console.log("token: ", token)
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(authReq);
        
        return next(authReq);
    }

    return next(req);
};
