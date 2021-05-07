import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';

import { Observable } from 'rxjs';

// based on https://blog.angular-university.io/angular-jwt-authentication/

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {

        const token = localStorage.getItem("token");

        if (token) {
            const cloned = req.clone({
                headers: req.headers.set("x-access-token",
                    token)
            });

            return next.handle(cloned);
        }
        else {
            return next.handle(req);
        }
    }
}