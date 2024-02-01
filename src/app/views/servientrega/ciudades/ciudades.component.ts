import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../../../services/admin/auth.service';
import {CiudadesService} from '../../../services/servientrega/ciudades/ciudades.service';

@Component({
  selector: 'app-ciudades',
  templateUrl: './ciudades.component.html',
  styleUrls: ['./ciudades.component.css']
})

export class CiudadesComponent implements OnInit, AfterViewInit {
  menu;
  ciuades = [];
  currentUserValue;

  constructor(
    private servientregaCiudades: CiudadesService,
    private authService: AuthService,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.obtenerListaParametros();
    this.menu = {
      modulo: 'servientrega',
      seccion: 'ciudades'
    };
  }

  ngAfterViewInit(): void {
  }

  obtenerListaParametros(): void {
    this.servientregaCiudades.obtenerCiudades().subscribe((result) => {
      this.ciuades = result;
    });
  }
}
