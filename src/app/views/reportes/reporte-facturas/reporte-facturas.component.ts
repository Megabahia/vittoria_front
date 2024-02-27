import {Component, OnInit, ViewChild} from '@angular/core';
import {ClientesService, Transaccion} from '../../../services/mdm/personas/clientes/clientes.service';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ReportesService} from '../../../services/reportes/reportes.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-reporte-facturas',
  templateUrl: './reporte-facturas.component.html',
  styleUrls: ['./reporte-facturas.component.css'],
  providers: [DatePipe]
})
export class ReporteFacturasComponent implements OnInit {
  @ViewChild('contenido') contenido;
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaReporteProductos;
  inicio = new Date();
  fin = new Date();

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1
  };
  public barChartType: ChartType = 'line';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] =
    [];
  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];
  datosTransferencias = {
    data: [], label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
  };
  clientes = [];

  constructor(
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private reporteProductosService: ReportesService
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    this.obtenerTransacciones();
  }

  obtenerTransacciones(): void {
    this.reporteProductosService.obtenerReporteProductos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaReporteProductos = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  verClientes(codigoProducto: string): void {
    this.reporteProductosService.obtenerClientesCompras(codigoProducto)
      .subscribe((info) => {
        this.modalService.open(this.contenido, {size: 'xl', centered: true});
        this.clientes = info.info;
      });
  }
}
