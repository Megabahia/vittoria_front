import {Component, OnInit} from '@angular/core';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Color, Label} from 'ng2-charts';
import {DatePipe} from '@angular/common';
import {ClientesService, Transaccion} from '../../../../services/mdm/personas/clientes/clientes.service';
import {PedidosService} from '../../../../services/mp/pedidos/pedidos.service';
import {Toaster} from 'ngx-toast-notifications';
import {FacturacionService} from '../../../../services/facturacion/facturacion.service';

@Component({
  selector: 'app-facturas-locales',
  templateUrl: './facturas-woocommerce.component.html',
  styleUrls: ['./facturas-woocommerce.component.css'],
  providers: [DatePipe]
})
export class FacturasWoocommerceComponent implements OnInit {
  menu;
  page = 1;
  pageSize = 3;
  collectionSize;
  listaTransacciones;
  inicio = new Date();
  fin = new Date();
  transaccion: any;
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
    private facturacionService: FacturacionService,
    private pedidosService: PedidosService,
    private toaster: Toaster,
  ) {
    this.inicio.setMonth(this.inicio.getMonth() - 3);
  }

  ngOnInit(): void {
    this.menu = {
      modulo: 'mdm',
      seccion: 'clientesTransac'
    };
    this.barChartData = [this.datosTransferencias];
    // this.obtenerTransacciones();
  }

  obtenerTransacciones(): void {
    this.pedidosService.obtenerListaPedidos({
      page: this.page - 1,
      page_size: this.pageSize,
      inicio: this.inicio,
      fin: this.fin,
      estadoSRI: null,
    }).subscribe((info) => {
      this.collectionSize = info.cont;
      this.listaTransacciones = info.info;
    });
  }

  transformarFecha(fecha): string {
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  obtenerTransaccion(id): void {
    this.pedidosService.obtenerPedido(id).subscribe((info) => {
      this.transaccion = info;
      console.log(info);
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
    this.facturacionService.facturarWoocommerce({facturas: this.listaFacturasEnviar}).subscribe(() => {
      this.toaster.open('Se envio correctamente', {type: 'success'});
    });
  }
}
