import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../../services/admin/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  currentUserValue;

  constructor(
    private authService: AuthService,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
  }

  ngOnInit(): void {
  }

}
