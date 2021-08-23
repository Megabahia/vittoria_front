import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;

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
  created_at;
}
@Injectable({
  providedIn: 'root'
})
export class GenerarService {

  constructor(private http: HttpClient) { }
  inicializarPrecios(){
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
      codigo: "",
      articulo: "",
      valorUnitario: 0,
      cantidad: 0,
      precios: {
        "precioVentaA":0,
        "precioVentaB":0,
        "precioVentaC":0,
      
      }
      ,
      precio:0,
      informacionAdicional: "",
      descuento: 0
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
    }
  }
  obtenerListaOfertas(datos) {
    return this.http.post<any>(`${apiUrl}/mdo/generarOferta/list/`, datos);
  }
  crearOferta(datos){
    return this.http.post<any>(`${apiUrl}/mdo/generarOferta/create/`, datos);
  }
}
