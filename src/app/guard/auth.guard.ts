import { Injectable } from '@angular/core';
import {
  Router, CanActivate
  , ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/admin/auth.service';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;
    console.log('ANTES IF AUTH', route, state)
    if (currentUser && this.authService.isLoggedIn()) {
      return true;
    }
    console.log('DESPUES IF AUTH')
    this.router.navigate(['/auth/signin']);
    return false;
  }

}
