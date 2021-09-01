import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;

export interface Detalles {
  id;
  codigo;
  articulo;
  valorUnitario;
  cantidad;
  precio;
  informacionAdicional;
  descuento;
  valorDescuento;
  imagen;
}
export interface Oferta {
  id;
  negocio;
  cliente;
  codigoOferta;
  fechaOferta;
  nombres;
  apellidos;
  identificacion;
  telefono;
  correo;
  vigenciaOferta;
  canalVentas;
  calificacionCliente;
  indicadorCliente;
  personaGenera;
  descripcion;
  total;
  iva;
  descuento;
  subTotal;
  created_at;
  detalles;
  numeroProductosComprados;
}
@Injectable({
  providedIn: 'root'
})
export class GenerarService {

  constructor(private http: HttpClient) { }
  inicializarPrecios() {
    return {
      "precioVentaA": 0,
      "precioVentaB": 0,
      "precioVentaC": 0,
      "precioVentaD": 0,
      "precioVentaE": 0
    };
  }
  inicializarDetalle() {
    return {
      id:0,
      codigo: "",
      articulo: "",
      valorUnitario: 0,
      cantidad: 0,
      precio: 0,
      informacionAdicional: "",
      descuento: 0,
      valorDescuento:0,
      imagen:""
    }
  }
  inicializarOferta() {
    return {
      id: 0,
      negocio: null,
      cliente: null,
      codigoOferta: "",
      fechaOferta: "",
      nombres: "",
      apellidos: "",
      identificacion: "",
      telefono: "",
      correo: "",
      vigenciaOferta: 0,
      canalVentas: "",
      calificacionCliente: 0,
      indicadorCliente: 0,
      personaGenera: "",
      descripcion: "",
      total: 0,
      created_at: "",
      iva:0,
      descuento:0,
      subTotal:0,
      detalles:[],
      numeroProductosComprados:0
    }
  }
  obtenerListaOfertas(datos) {
    return this.http.post<any>(`${apiUrl}/mdo/generarOferta/list/`, datos);
  }
  crearOferta(datos) {
    return this.http.post<any>(`${apiUrl}/mdo/generarOferta/create/`, datos);
  }
}
