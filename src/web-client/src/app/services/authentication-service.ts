import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public isLoggedIn: boolean;

    constructor(private http: HttpClient) {
        if (localStorage.getItem('currentUser')) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }

    login(username: string, password: string) {
        return this.http.post<any>('/svc/auth/login', { username: username, password: password })
            .pipe(map((res: any) => {
                // login successful if there's a jwt token in the response
                if (res && res.token) {
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username, token: res.token }));
                    this.isLoggedIn = true;
                }
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.isLoggedIn = false;
    }
}