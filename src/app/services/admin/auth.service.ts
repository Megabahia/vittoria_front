import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import {SharedDataService} from '../../shared/shared-data.service';
const apiUrl: string = environment.apiUrl;

export interface User {
  token: string,
  id: number,
  full_name: string,
  email: string,
  tokenExpiracion: string
}
export interface UserLogin {
  username: string;
  password?: string;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }
  public get currentUserValue(): User {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  static getExpiration(): moment.Moment {
    const expiration = localStorage.getItem('expiresAt');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

  isLoggedIn = () => moment().isBefore(AuthService.getExpiration());


  signIn({ username, password }: UserLogin) {
    let data = this.http.post<any>(`${apiUrl}/adm/auth/login/`, {
      username,
      password
    }
    ).pipe(map(
      user => {
        if (user && user.token) {
          const expiresAt = moment().add(user.tokenExpiracion, 'seconds');
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('expiresAt', JSON.stringify(expiresAt.valueOf()));
          this.currentUserSubject.next(user);
        }
        return user;
      }
    ));
    return data;
  }
  signOut() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem('expiresAt');
    this.currentUserSubject.next(null);
    this.sharedDataService.setSharedData(false);
  }
  enviarCorreoCambioClave(datos){
    return this.http.post<any>(`${apiUrl}/adm/auth/password_reset/`,datos);
  }
  enviarClaveNueva(datos){
    return this.http.post<any>(`${apiUrl}/adm/auth/password_reset/confirm/`,datos);
  }
}
