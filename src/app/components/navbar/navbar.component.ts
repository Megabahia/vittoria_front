import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/admin/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService,) { }

  ngOnInit(): void {
  }
  cerrarSesion() {
    this.authService.signOut();
    window.location.href='/auth/signin';
  }
}
