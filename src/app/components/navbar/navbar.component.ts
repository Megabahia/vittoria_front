import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/admin/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  usuario;
  constructor(private authService: AuthService, private router: Router) {
    this.usuario = JSON.parse(localStorage.getItem('currentUser'));

  }

  ngOnInit(): void {
  }
  cerrarSesion() {
    this.authService.signOut();
    this.router.navigate(['/auth/signin']);
  }
}
