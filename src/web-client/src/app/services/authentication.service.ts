import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { APIService } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public isLoggedIn: boolean;

    constructor(private _apiService: APIService) {
        if (localStorage.getItem('currentUser')) {
            this.isLoggedIn = true;
        } else {
            this.isLoggedIn = false;
        }
    }

    public login(username: string, password: string): Observable<any> {
        return this._apiService.postData<any, any>('/svc/auth/login', { username: username, password: password })
            .pipe(map((res: any) => {
                // login successful if there's a jwt token in the response
                if (res && res.token) {
                    // store username and jwt token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify({ username, token: res.token }));
                    this.isLoggedIn = true;
                    res = true;
                } else if (res && res.errorMessage) {
                    this.isLoggedIn = false;
                    res = false;
                }
            }));
    }

    public logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        this.isLoggedIn = false;
    }
}