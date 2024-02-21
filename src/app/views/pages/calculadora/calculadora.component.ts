import {Component, OnInit} from '@angular/core';
import Decimal from 'decimal.js';
import {Toast, Toaster} from 'ngx-toast-notifications';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ParamService as MDPParamService} from '../../../services/mdp/param/param.service';

@Component({
  selector: 'app-calculadora',
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css']
})
export class CalculadoraComponent implements OnInit {

  miFormulario: FormGroup;
  calculos: {
    valorPagar,
    montoIva,
    subtotal,
    costoEnvio,
    precioProducto,
    comisionAsesor,
  } = {
    valorPagar: 0,
    montoIva: 0,
    subtotal: 0,
    costoEnvio: 0,
    precioProducto: 0,
    comisionAsesor: 0,
  };
  pagina: any = {};
  costoEnvio;
  comisionAsesor;
  iva = 12;

  hero: { name } = {name: ''};

  constructor(
    private MDPparamService: MDPParamService,
    private toaster: Toaster,
    private formBuilder: FormBuilder,
  ) {
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    // Ocultamos el toolbar y navbar
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }
    this.miFormulario = this.formBuilder.group({
      precioProducto: ['', [Validators.required, Validators.min(1), Validators.max(50000)]],
    });
  }

  get tForm() {
    return this.miFormulario.controls;
  }

  ngOnInit(): void {
    this.MDPparamService.obtenerListaPadres('PAGINA_CALCULADORA_COMISIONES').subscribe((info: []) => {
      this.pagina.titulo = info.find((item: any) => {
        return item.nombre === 'TITULO';
      });
      this.pagina.subtitulo = info.find((item: any) => {
        return item.nombre === 'SUBTITULO';
      });
      this.pagina.nombreFormulario = info.find((item: any) => {
        return item.nombre === 'FORMULARIO';
      });
      this.costoEnvio = info.find((item: any) => {
        return item.nombre === 'COSTO_ENVIO';
      })['valor'];
      this.comisionAsesor = info.find((item: any) => {
        return item.nombre === 'COMISION_VENDEDOR';
      })['valor'];
      this.pagina.pagarCliente = info.find((item: any) => {
        return item.nombre === 'PAGAR_CLIENTE';
      })['valor'];
      this.pagina.montoIva = info.find((item: any) => {
        return item.nombre === 'MONTO_IVA';
      })['valor'];
      this.pagina.subtotal = info.find((item: any) => {
        return item.nombre === 'SUBTOTAL';
      })['valor'];
      this.pagina.costoEnvio = info.find((item: any) => {
        return item.nombre === 'COSTO_ENVIO_LABEL';
      })['valor'];
      this.pagina.precioProducto = info.find((item: any) => {
        return item.nombre === 'PRECIO_PRODUCTO';
      })['valor'];
      this.pagina.mensajeVendedor = info.find((item: any) => {
        return item.nombre === 'MESANJE_VENDEDOR';
      })['valor'];
      this.pagina.comisionAsesor = info.find((item: any) => {
        return item.nombre === 'COMISION_ASESOR';
      })['valor'];
    });
    this.MDPparamService.obtenerListaPadres('TIPO_IVA').subscribe(({info}: any) => {
      this.iva = info[0].valor;
    });
  }

  calcular(): void {
    if (this.miFormulario.invalid) {
      this.toaster.open('Verifique los valores', {type: 'danger'});
      return;
    }
    const precioProducto = this.miFormulario.value.precioProducto;
    const comision = new Decimal(this.comisionAsesor).div(100).toString();
    const iva = new Decimal(this.iva).div(100).add(1).toFixed(2).toString();
    this.calculos.valorPagar = precioProducto;
    this.calculos.montoIva = new Decimal(precioProducto).sub(new Decimal(precioProducto).div(iva).toFixed(2)).toString();
    this.calculos.subtotal = new Decimal(precioProducto).sub(this.calculos.montoIva).toFixed(2).toString();
    this.calculos.costoEnvio = this.costoEnvio;
    const porcentaje = new Decimal(1).add(comision).toString();
    this.calculos.precioProducto = new Decimal(new Decimal(this.calculos.subtotal).sub(this.costoEnvio)).div(porcentaje).toFixed(2).toString();
    this.calculos.comisionAsesor = new Decimal(this.calculos.precioProducto).mul(comision).toFixed(2).toString();
  }

  resetearValores(): void {
    this.calculos = {
      valorPagar: 0,
      montoIva: 0,
      subtotal: 0,
      costoEnvio: 0,
      precioProducto: 0,
      comisionAsesor: 0,
    };
  }
}
