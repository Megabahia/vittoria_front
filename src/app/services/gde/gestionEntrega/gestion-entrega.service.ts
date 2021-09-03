import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;

export interface GestionEntrega {
  id;
  entregoProducto;
  fechaEntrega;
  calificacion;
  estado;
}
@Injectable({
  providedIn: 'root'
})
export class GestionEntregaService {


  constructor(private http: HttpClient) { }
  inicializarGestionEntrega() {
    return {
      id:0,
      entregoProducto:"",
      fechaEntrega:"",
      calificacion:"",
      estado:""
    }
  }
  obtenerListaGestionEntrega(datos) {
    return this.http.post<any>(`${apiUrl}/gde/gestionEntrega/list/`, datos);
  }
  obtenerUltimosProductos(id) {
    return this.http.get<any>(`${apiUrl}/gde/gestionEntrega/productosImagenes/${id}`);
  }
  obtenerGestionEntrega(id) {
    return this.http.get<any>(`${apiUrl}/gde/gestionEntrega/listOne/${id}`);
  }
  actualizarGestionEntrega(datos){
    return this.http.post<any>(`${apiUrl}/gde/gestionEntrega/update/${datos.id}`,datos);
  }
}
