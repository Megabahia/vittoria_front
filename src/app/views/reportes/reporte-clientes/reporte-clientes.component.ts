import {Component, OnInit} from '@angular/core';
import {ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ReportesService} from '../../../services/reportes/reportes.service';

@Component({
  selector: 'app-reporte-clientes',
  templateUrl: './reporte-clientes.component.html',
  styleUrls: ['./reporte-clientes.component.css'],
  providers: [DatePipe]
})
export class ReporteClientesComponent implements OnInit {
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaReporte;
  inicio = new Date();
  fin = new Date();

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1
  };
  public barChartType: ChartType = 'line';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartColors: Color[] = [{
    backgroundColor: '#84D0FF'
  }];

  constructor(
    private datePipe: DatePipe,
    private reporteProductosService: ReportesService
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.obtenerReporteClientes();
  }

  obtenerReporteClientes(): void {
    this.reporteProductosService.obtenerReporteClientes({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaReporte = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }
}
