import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class APIService {
    private _httpOptions: {};

    constructor(private _http: HttpClient) {
        this._httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    public getData<T>(url: string): Observable<T> {
        return this._http.get<T>(url);
            // .pipe(catchError(this._handleError));
    }

    public postData<T, U>(url: string, data: T): Observable<U> {
        return this._http.post<U>(url, data, this._httpOptions)
            .pipe(catchError(this._handleError));
    }

    public putData<T, U>(url: string, data: T): Observable<U> {
        return this._http.put<U>(url, data, this._httpOptions)
            .pipe(catchError(this._handleError));
    }

    public deleteData<T, U>(url: string, data: T): Observable<U> {
        return this._http.delete<U>(url, this._httpOptions)
            .pipe(catchError(this._handleError));
    }

    private _handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
        }

        // return an observable with a user-facing error message
        return throwError('Something bad happened; please try again later.');
    };
}
