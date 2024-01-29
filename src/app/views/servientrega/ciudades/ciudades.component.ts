import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgbModal, NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {AuthService} from '../../../services/admin/auth.service';
import {CiudadesService} from '../../../services/servientrega/ciudades/ciudades.service';
import {environment} from 'src/environments/environment';

@Component({
  selector: 'app-ciudades',
  templateUrl: './ciudades.component.html',
  styleUrls: ['./ciudades.component.css']
})

export class CiudadesComponent implements OnInit, AfterViewInit {
  menu;
  ciuades = [
    {id: 1, nombre: 'Prueba'},
    {id: 2, nombre: 'Prueba2'},
    {id: 3, nombre: 'Prueba3'},
  ];
  currentUserValue;
  user = environment.user;
  password = environment.password;

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
    this.servientregaCiudades.obtenerCiudades(`['${this.user}','${this.password}']`).subscribe((result) => {
      this.ciuades = result;
    });
  }
}
