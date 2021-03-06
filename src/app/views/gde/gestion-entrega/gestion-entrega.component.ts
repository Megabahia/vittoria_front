import { Component, OnInit, ViewChild } from '@angular/core';
import { GestionEntregaService, GestionEntrega } from '../../../services/gde/gestionEntrega/gestion-entrega.service';
import { DatePipe } from '@angular/common';
import { ParamService as ParamServiceADM } from 'src/app/services/admin/param.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-gestion-entrega',
  templateUrl: './gestion-entrega.component.html',
  providers: [DatePipe]
})
export class GestionEntregaComponent implements OnInit {

  @ViewChild('dismissModal') dismissModal;
  @ViewChild('aviso') aviso;

  entregaForm: FormGroup;

  submittedEntrega = false;
  mensaje = "";
  menu;
  tipoCliente = "";
  identificacion;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  listaEntregas;
  entrega;
  ultimosProductos;
  constructor(
    private gestionEntregaService: GestionEntregaService,
    private datePipe: DatePipe,
    private globalParam: ParamServiceADM,
    private _formBuilder: FormBuilder,
    private modalService: NgbModal,
  ) {
    this.entrega = this.gestionEntregaService.inicializarGestionEntrega();
  }

  get enForm() {
    return this.entregaForm.controls;
  }
  ngOnInit(): void {
    this.entregaForm = this._formBuilder.group({
      entregoProducto: ['', [Validators.required]],
      fechaEntrega: ['', [Validators.required]],
      horaEntrega: ['', [Validators.required]],
      calificacion: [0, [Validators.required]],
      estado: ['', [Validators.required]],
    });
    this.menu = {
      modulo: "gde",
      seccion: "gestEntrega"
    };
    this.obtenerListaGestionEntrega();
  }

  obtenerListaGestionEntrega() {
    let fecha = this.fecha.split(' to ');
    this.inicio = fecha[0] ? fecha[0] : "";
    this.fin = fecha[1] ? fecha[1] : "";
    let busqueda: any = {
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    };
    if (this.tipoCliente == 'negocio') {
      busqueda = { ...busqueda, negocio: 1, identificacion: this.identificacion }
    } else if (this.tipoCliente == 'cliente') {
      busqueda = { ...busqueda, cliente: 1, identificacion: this.identificacion }
    }
    this.gestionEntregaService.obtenerListaGestionEntrega(
      busqueda
    ).subscribe((info) => {
      this.listaEntregas = info.info;
      this.collectionSize = info.cont;
    });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  primeraLetra(nombre, apellido) {
    let iniciales = nombre.charAt(0) + apellido.charAt(0);
    return iniciales;
  }
  obternerGestionEntrega(id) {
    this.gestionEntregaService.obtenerGestionEntrega(id).subscribe((info) => {
      this.entrega = info;
    });
  }
  obtenerUltimosProductos(id) {
    this.gestionEntregaService.obtenerUltimosProductos(id).subscribe((info) => {
      info.map((prod) => {
        prod.imagen = this.obtenerURLImagen(prod.imagen);
      });
      this.ultimosProductos = info;
    });
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  actualizarGestionEntrega() {
    this.submittedEntrega = true;
    if (this.entregaForm.invalid) {
      return;
    }
    this.gestionEntregaService.actualizarGestionEntrega(this.entrega).subscribe(() => {
      this.obtenerListaGestionEntrega();
      this.mensaje = "Entrega guardada";
      this.abrirModal(this.aviso);
      this.dismissModal.nativeElement.click();
      this.submittedEntrega = false;
    },
      (error) => {
        let errores = Object.values(error);
        let llaves = Object.keys(error);
        this.mensaje = "";
        errores.map((infoErrores, index) => {
          this.mensaje += llaves[index] + ": " + infoErrores + "<br>";
        });
        this.abrirModal(this.aviso);
      });

  }
  cerrarModal() {
    this.modalService.dismissAll();
  }
  abrirModal(modal) {
    this.modalService.open(modal);
  }
}
