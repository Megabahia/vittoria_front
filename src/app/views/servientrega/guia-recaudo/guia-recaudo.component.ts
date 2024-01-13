import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CiudadesService} from '../../../services/servientrega/ciudades/ciudades.service';
import {AuthService} from '../../../services/admin/auth.service';
import {GuiasService} from '../../../services/servientrega/guias/guias.service';

@Component({
  selector: 'app-guia-recaudo',
  templateUrl: './guia-recaudo.component.html',
  styleUrls: ['./guia-recaudo.component.css']
})
export class GuiaRecaudoComponent implements OnInit {
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

  constructor(
    private formBuilder: FormBuilder,
    private servientregaCiudades: CiudadesService,
    private authService: AuthService,
    private guiasService: GuiasService,
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
      SECTOR_DESTINAT_NE: ['', [Validators.required]],
      TELEFONO1_DESTINAT_NE: ['', []],
      TELEFONO2_DESTINAT_NE: ['', [Validators.required]],
      CODIGO_POSTAL_DEST_NE: ['', []],
      CORREO_DESTINATARIO: ['', []],
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
      FECHA_FACTURA: ['', [Validators.required]],
      NUMERO_FACTURA: [1, [Validators.required]],
      VALOR_FACTURA: [0, [Validators.required]],
      VALOR_FLETE: [0, [Validators.required]],
      VALOR_COMISION: [0, [Validators.required]],
      VALOR_SEGURO: [0, [Validators.required]],
      VALOR_IMPUESTO: [0, [Validators.required]],
      VALOR_OTROS: [0, [Validators.required]],
      VALOR_A_RECAUDAR: [0, [Validators.required]],
      DETALLE_ITEMS_FACTURA: [0, [Validators.required]],
      VERIFICAR_CONTENIDO_RECAUDO: [0, [Validators.required]],
      VALIDADOR_RECAUDO: [0, [Validators.required]],
      ID_CL: [0, [Validators.required]],
      DIRECCION_RECAUDO: [0, [Validators.required]],
      LOGIN_CREACION: ['', []],
      PASSWORD: ['', []],
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
    alert('Se envia a la api');

    this.guiasService.generarGuiaRecaudo(this.reactiveGuideForm.value).subscribe(() => {
      alert('Se guardo');
    });
  }
}
