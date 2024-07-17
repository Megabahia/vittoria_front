import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidacionesPropias} from "../../../utils/customer.validators";
import {ParamService as ParamServiceAdm} from "../../../services/admin/param.service";
import {PedidosService} from "../../../services/mp/pedidos/pedidos.service";
import {logger} from "codelyzer/util/logger";
import {Toaster} from "ngx-toast-notifications";
import {IntegracionesEnviosService} from "../../../services/admin/integraciones_envios.service";
import {ProductosService} from "../../../services/mdp/productos/productos.service";

interface ProductoProcesado {
  canal?: string;

  [key: string]: any; // Esto permite cualquier nombre de clave adicional
}

@Component({
  selector: 'app-consulta-productos',
  templateUrl: './consulta-productos.component.html',
  styleUrls: ['./consulta-productos.component.css']
})


export class ConsultaProductosComponent implements OnInit {

  @Input() paises;
  public notaPedido: FormGroup;
  archivo: FormData = new FormData();

  tipoIdentificacion;
  datos: any[] = [];
  pais = 'Ecuador';
  provincia = '';
  ciudad = '';
  ciudadOpciones;
  provinciaOpciones;
  page = 1;
  page_size: any = 3;
  parametros;

  codigoBarras;
  producto;
  integracionProducto;

  constructor(
    private paramServiceAdm: ParamServiceAdm,
    private toaster: Toaster,
    private _router: Router,
    private integracionesEnviosService: IntegracionesEnviosService,
    private productosService: ProductosService,
  ) {
    /*const ref = document.referrer;
    const host = document.location.host;
    if (ref !== 'https://superbarato.megadescuento.com/') {
      if (host !== '209.145.61.41:4201') {
        this._router.navigate([
          '/auth/signin'
        ]);
        localStorage.clear();
        return;
      }
    }*/
    const navbar = document.getElementById('navbar');
    const toolbar = document.getElementById('toolbar');
    if (navbar && toolbar) {
      navbar.style.display = 'none';
      toolbar.style.display = 'none';
    }

  }

  ngOnInit(): void {
    this.obtenerProvincias();
  }

  async obtenerProducto(): Promise<void> {
    return new Promise((resolve, reject) => {
      const data = {
        codigoBarras: this.codigoBarras,
      };
      this.productosService.obtenerProductoPorCodigoCanal(data).subscribe((info) => {
        this.producto = info.producto;
        //this.integracionProducto = info.integraciones_canal;
      }, error => this.toaster.open(error, {type: 'danger'}));
    });
  }

  obtenerProvincias(): void {
    this.paramServiceAdm.obtenerListaHijos(this.pais, 'PAIS').subscribe((info) => {
      this.provinciaOpciones = info;
    });
    console.log(this.provincia);
  }

  obtenerCiudad(): void {
    this.paramServiceAdm.obtenerListaHijos(this.provincia, 'PROVINCIA').subscribe((info) => {
      this.ciudadOpciones = info;
    });
  }
}



