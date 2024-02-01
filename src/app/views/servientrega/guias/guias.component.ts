import {Component, OnInit} from '@angular/core';
import {CiudadesService} from '../../../services/servientrega/ciudades/ciudades.service';
import {AuthService} from '../../../services/admin/auth.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {GuiasService} from '../../../services/servientrega/guias/guias.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-guias',
  templateUrl: './guias.component.html',
  styleUrls: ['./guias.component.css']
})
export class GuiasComponent implements OnInit {
  productosServiCli = [
    {id: 1, nombre: 'DOCUMENTO UNITARIO'},
    {id: 2, nombre: 'MERCANCIA PREMIER'},
    {id: 3, nombre: 'DOCUMENTO MASIVO'},
    {id: 6, nombre: 'MERCANCIA INDUSTRIAL'},
    {id: 8, nombre: 'VALIJA EMPRESARIAL'},
    {id: 71, nombre: 'FARMA'},
  ];
  menu;
  public ReactiveUserDetailsForm: FormGroup;
  submitted = false;
  currentUserValue;
  ciudades = [];

  constructor(
    private formBuilder: FormBuilder,
    private servientregaCiudades: CiudadesService,
    private authService: AuthService,
    private guiasService: GuiasService,
    private toaster: Toaster,
  ) {
    this.currentUserValue = this.authService.currentUserValue;
    this.ReactiveUserDetailsForm = this.formBuilder.group({
      id_tipo_logistica: [1, [Validators.required]],
      detalle_envio_1: ['', []],
      detalle_envio_2: ['', []],
      detalle_envio_3: ['', []],
      id_ciudad_origen: ['', [Validators.required]],
      id_ciudad_destino: ['', [Validators.required]],
      id_destinatario_ne_cl: ['', [Validators.required]],
      razon_social_desti_ne: ['', [Validators.required]],
      nombre_destinatario_ne: ['', [Validators.required]],
      apellido_destinatar_ne: ['', [Validators.required]],
      direccion1_destinat_ne: ['', [Validators.required]],
      sector_destinat_ne: ['', []],
      telefono1_destinat_ne: ['', [Validators.required]],
      telefono2_destinat_ne: ['', []],
      codigo_postal_dest_ne: ['', []],
      id_remitente_cl: ['', [Validators.required]],
      razon_social_remite: ['', [Validators.required]],
      nombre_remitente: ['', [Validators.required]],
      apellido_remite: ['', [Validators.required]],
      direccion1_remite: ['', [Validators.required]],
      sector_remite: ['', []],
      telefono1_remite: ['', [Validators.required]],
      telefono2_remite: ['', []],
      codigo_postal_remi: ['', []],
      id_producto: ['', [Validators.required]],
      contenido: ['', [Validators.required]],
      numero_piezas: ['', [Validators.required]],
      valor_mercancia: ['', [Validators.required]],
      valor_asegurado: ['', [Validators.required]],
      largo: ['', [Validators.required]],
      ancho: ['', [Validators.required]],
      alto: ['', [Validators.required]],
      peso_fisico: ['', [Validators.required]],
      login_creacion: ['', []],
      password: ['', []],
    });
    this.servientregaCiudades.obtenerCiudades().subscribe((ciudades) => {
      this.ciudades = ciudades;
    });
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'servientrega',
      seccion: 'ciudades'
    };
  }


  // getter for easy access to form fields

  get reactiveForm(): any {
    return this.ReactiveUserDetailsForm.controls;
  }

  generarGuia(): void {
    this.submitted = true;
    if (this.ReactiveUserDetailsForm.invalid) {
      return;
    }
    this.guiasService.generarGuia(this.ReactiveUserDetailsForm.value).subscribe((info) => {
      this.toaster.open(`${info.id} ${info.msj}`, {type: 'success'});
    });
  }
}
