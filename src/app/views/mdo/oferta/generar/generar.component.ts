import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { ParamService } from 'src/app/services/admin/param.service';
import { ExportService } from '../../../../services/admin/export.service';
import { GenerarService, Oferta } from '../../../../services/mdo/ofertas/generar/generar.service';
import { FormArray, FormBuilder } from '@angular/forms';
import { ClientesService } from '../../../../services/mdm/personas/clientes/clientes.service';
import { NegociosService } from '../../../../services/mdm/personas/negocios/negocios.service';

@Component({
  selector: 'app-generar',
  templateUrl: './generar.component.html',
  providers: [DatePipe]
})
export class GenerarComponent implements OnInit {
  @ViewChild(NgbPagination) paginator: NgbPagination;
  menu;
  page = 1;
  pageSize: any = 10;
  maxSize;
  collectionSize;
  fecha = "";
  inicio = "";
  fin = "";
  ultimosProductos;
  prediccion;
  cliente;
  tipoCliente = "";
  tipoClienteModal = "";
  identificacion;
  infoExportar = [];
  listaOfertas;

  oferta: Oferta;
  tipoClienteOferta = "";


  detallesForm;
  detalles: FormArray;
  detallesTransac;
  public isCollapsed = [];

  constructor(
    private formBuilder: FormBuilder,
    private generarService: GenerarService,
    private datePipe: DatePipe,
    private globalParam: ParamService,
    private exportFile: ExportService,
    private clientesService: ClientesService,
    private negociosService: NegociosService
  ) {
    this.oferta = this.generarService.inicializarOferta();
  }

  ngOnInit(

  ): void {
    this.menu = {
      modulo: "mdo",
      seccion: "genOferta"
    };
    this.detallesForm = this.formBuilder.group({
      detalles: new FormArray([this.crearDetalle()])
    });
  }

  async ngAfterViewInit() {
    this.iniciarPaginador();
    this.obtenerListaOfertas();
  }
  async iniciarPaginador() {
    this.paginator.pageChange.subscribe(() => {
      this.obtenerListaOfertas();
    });
  }
  obtenerListaOfertas() {
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
    this.generarService.obtenerListaOfertas(
      busqueda
    ).subscribe((info) => {
      this.listaOfertas = info.info;
      this.collectionSize = info.cont;
    });
  }
  transformarFecha(fecha) {
    let nuevaFecha = this.datePipe.transform(fecha, 'yyyy-MM-dd');
    return nuevaFecha;
  }
  obtenerURLImagen(url) {
    return this.globalParam.obtenerURL(url);
  }
  crearDetalle() {
    return this.formBuilder.group(this.generarService.inicializarDetalle());
  }
  addItem(): void {
    this.detalles = this.detallesForm.get('detalles') as FormArray;
    this.detalles.push(this.crearDetalle());
    this.isCollapsed.push(false);
  }
  removeItem(i): void {
    this.isCollapsed.splice(i, 1);
    this.detalles.removeAt(i);
  }
  obtenerCliente() {
    if (this.tipoClienteOferta == "cliente") {
      this.clientesService.obtenerClientePorCedula({ cedula: this.oferta.identificacion }).subscribe((info) => {
        console.log(info);
      });
    } else if (this.tipoClienteOferta == "negocio") {
      this.negociosService.obtenerNegocioPorRuc({ ruc: this.oferta.identificacion }).subscribe((info) => {
        console.log(info);
      })
    }
  }
  // obtenerUltimosProductos(id) {
  //   return this.generarService.obtenerUltimasOfertas(id).subscribe((info) => {
  //     info.map((prod) => {
  //       prod.imagen = this.obtenerURLImagen(prod.imagen);
  //     });
  //     this.ultimosProductos = info;
  //   });
  // }

}
