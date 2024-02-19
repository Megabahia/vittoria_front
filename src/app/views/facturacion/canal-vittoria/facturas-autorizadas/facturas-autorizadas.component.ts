import { Component, OnInit } from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ClientesService, Transaccion} from '../../../../services/mdm/personas/clientes/clientes.service';

@Component({
  selector: 'app-facturas-autorizadas',
  templateUrl: './facturas-autorizadas.component.html',
  styleUrls: ['./facturas-autorizadas.component.css'],
  providers: [DatePipe]
})
export class FacturasAutorizadasComponent implements OnInit {
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaTransacciones;
  inicio = new Date();
  fin = new Date();
  transaccion: Transaccion = {
    canal: '',
    cliente: '',
    correo: '',
    created_at: '',
    descuento: 0,
    detalles: [],
    direccion: '',
    fecha: '',
    id: 0,
    identificacion: '',
    iva: '',
    nombreVendedor: '',
    numeroFactura: 0,
    numeroProductosComprados: '',
    razonSocial: '',
    subTotal: 0,
    telefono: '',
    tipoIdentificacion: '',
    total: 0,
    pais: '',
    provincia: '',
    ciudad: '',
    callePrincipal: '',
    calleSecundaria: '',
    numeroCasa: '',
    referencia: '',
  };
  basicDemoValue = '2017-01-01';
  listaFacturasEnviar = [];

  public barChartOptions: ChartOptions = {
    responsive: true,
    aspectRatio: 1
  };
  public barChartLabels: Label[] = [
    '2006',
    '2007',
    '2008',
    '2009',
    '2010',
    '2011',
    '2012'
  ];
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

  constructor(
    private datePipe: DatePipe,
    private clientesService: ClientesService
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

  obtenerTransacciones() {
    this.clientesService.obtenerTodasTrasacciones({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
      this.obtenerGraficos();
    });
  }

  transformarFecha(fecha) {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  async obtenerTransaccion(id) {
    this.clientesService.obtenerTransaccion(id).subscribe((info) => {
      this.transaccion = info;
      console.log(info);
    });
  }

  async obtenerGraficos() {
    this.clientesService.obtenerGraficaTransaccionesGeneral({
        page: this.page - 1,
        page_size: this.pageSize,
        inicio: this.inicio,
        fin: this.fin
      }
    ).subscribe((info) => {
      let etiquetas = [];
      let valores = [];

      info.map((datos) => {
        etiquetas.push(datos.anio + '-' + datos.mes);
        valores.push(datos.cantidad);
      });
      this.datosTransferencias = {
        data: valores, label: 'Series A', fill: false, borderColor: 'rgb(75, 192, 192)'
      };
      this.barChartData = [this.datosTransferencias];
      this.barChartLabels = etiquetas;
    });
  }

  procesarEnvio(id): void {
    this.clientesService.procesarEnvio(id).subscribe((info) => {
      this.transaccion = info;
      this.obtenerTransacciones();
    });
  }

  seleccionTodo(): void {
    // Invierte el estado de selección de todas las facturas
    this.listaFacturasEnviar = this.listaFacturasEnviar.length !== this.listaTransacciones.length
      ? [...this.listaTransacciones]
      : [];

    // Actualiza los checkboxes sin usar querySelector
    this.listaTransacciones.forEach((transaccion, i) => {
      const checkbox = document.getElementById(`transaccion-${i}`) as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = this.listaFacturasEnviar.includes(transaccion);
      }
    });

    console.log('listaEnviar', this.listaFacturasEnviar);
  }

  agregarFacturas(factura): void {
    const facturaExistenteIndex = this.listaFacturasEnviar.findIndex(item => item.id === factura.id);
    if (facturaExistenteIndex === -1) {
      // La factura no existe en la lista, así que la agregamos
      this.listaFacturasEnviar.push(factura);
    } else {
      // La factura ya existe en la lista, la eliminamos
      this.listaFacturasEnviar = this.listaFacturasEnviar.filter((item, index) => index !== facturaExistenteIndex);
    }
    console.log('lista', this.listaFacturasEnviar);
  }

  enviarFacturar(): void {
  }
}
