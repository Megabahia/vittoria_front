import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CiudadesService} from '../../../services/servientrega/ciudades/ciudades.service';
import {AuthService} from '../../../services/admin/auth.service';
import {GuiasService} from '../../../services/servientrega/guias/guias.service';
import {Toaster} from 'ngx-toast-notifications';

@Component({
  selector: 'app-guia-retorno',
  templateUrl: './guia-retorno.component.html',
  styleUrls: ['./guia-retorno.component.css']
})
export class GuiaRetornoComponent implements OnInit {
  productosServiCli = [
    {id: 1, nombre: 'DOCUMENTO UNITARIO'},
    {id: 2, nombre: 'MERCANCIA PREMIER'},
    {id: 3, nombre: 'DOCUMENTO MASIVO'},
    {id: 6, nombre: 'MERCANCIA INDUSTRIAL'},
    {id: 8, nombre: 'VALIJA EMPRESARIAL'},
    {id: 71, nombre: 'FARMA'},
  ];
  menu;
  public reactiveGuideForm: FormGroup;
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
    this.reactiveGuideForm = this.formBuilder.group({
      ID_TIPO_LOGISTICA: [1, [Validators.required]],
      DETALLE_ENVIO_1: ['', []],
      DETALLE_ENVIO_2: ['', []],
      DETALLE_ENVIO_3: ['', []],
      ID_CIUDAD_ORIGEN: ['', [Validators.required]],
      ID_CIUDAD_DESTINO: ['', [Validators.required]],
      ID_DESTINATARIO_NE_CL: ['', [Validators.required]],
      RAZON_SOCIAL_DESTI_NE: ['', [Validators.required]],
      NOMBRE_DESTINATARIO_NE: ['', [Validators.required]],
      APELLIDO_DESTINATAR_NE: ['', [Validators.required]],
      DIRECCION1_DESTINAT_NE: ['', [Validators.required]],
      SECTOR_DESTINAT_NE: ['', []],
      TELEFONO1_DESTINAT_NE: ['', [Validators.required]],
      TELEFONO2_DESTINAT_NE: ['', []],
      CODIGO_POSTAL_DEST_NE: ['', []],
      ID_REMITENTE_CL: ['', [Validators.required]],
      RAZON_SOCIAL_REMITE: ['', [Validators.required]],
      NOMBRE_REMITENTE: ['', [Validators.required]],
      APELLIDO_REMITE: ['', [Validators.required]],
      DIRECCION1_REMITE: ['', [Validators.required]],
      SECTOR_REMITE: ['', []],
      TELEFONO1_REMITE: ['', [Validators.required]],
      TELEFONO2_REMITE: ['', []],
      CODIGO_POSTAL_REMI: ['', []],
      ID_PRODUCTO: ['', [Validators.required]],
      CONTENIDO: ['', [Validators.required]],
      NUMERO_PIEZAS: ['', [Validators.required]],
      VALOR_MERCANCIA: ['', [Validators.required]],
      VALOR_ASEGURADO: ['', [Validators.required]],
      LARGO: ['', [Validators.required]],
      ANCHO: ['', [Validators.required]],
      ALTO: ['', [Validators.required]],
      PESO_FISICO: ['', [Validators.required]],
      NUMERO_GUIA_RETORNO: ['', [Validators.required]],
      PRODUCTO_1: [1, [Validators.required]],
      PRODUCTO_2: [0, [Validators.required]],
      PRODUCTO_3: [0, [Validators.required]],
      PRODUCTO_4: [0, [Validators.required]],
      PRODUCTO_5: [0, [Validators.required]],
      LOGIN_CREACION: ['', []],
      PASSWORD: ['', []],
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
    return this.reactiveGuideForm.controls;
  }

  generarGuia(): void {
    this.submitted = true;

    // stop here if form is invalid
    if (this.reactiveGuideForm.invalid) {
      return;
    }

    this.guiasService.generarGuiaRetorno(this.reactiveGuideForm.value).subscribe((info) => {
      this.toaster.open(`${info.id} ${info.msj}`, {type: 'success'});
    });
  }
}
