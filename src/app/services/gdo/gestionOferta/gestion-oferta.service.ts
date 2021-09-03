import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;

export interface GestionOferta {
  id;
  fechaCompra;
  comunicoOferta;
  fechaComunicacion;
  aceptoOferta;
  fechaAceptacion;
  calificacionOferta;
  estado;
}
@Injectable({
  providedIn: 'root'
})
export class GestionOfertaService {

  constructor(private http: HttpClient) { }
  inicializarGestionOferta(){
    return {
      id:0,
      fechaCompra:"",
      comunicoOferta:"",
      fechaComunicacion:"",
      aceptoOferta:"",
      fechaAceptacion:"",
      calificacionOferta:"",
      estado:"",
    }
  }
  obtenerListaGestionOferta(datos) {
    return this.http.post<any>(`${apiUrl}/gdo/gestionOferta/list/`, datos);
  }
  obtenerUltimosProductos(id) {
    return this.http.get<any>(`${apiUrl}/gdo/gestionOferta/productosImagenes/${id}`);
  }
  obtenerGestionOferta(id) {
    return this.http.get<any>(`${apiUrl}/gdo/gestionOferta/listOne/${id}`);
  }
  actualizarGestionOferta(datos){
    return this.http.post<any>(`${apiUrl}/gdo/gestionOferta/update/${datos.id}`,datos);
  }
}
