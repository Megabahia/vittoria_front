import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const  apiUrl:string  = environment.apiUrl;

export interface PrediccionCross{
  id;
  factura_id;
  fechaPredicciones;
  nombres;
  apellidos;
  identificacion;
  telefono;
  correo;
  cliente;
  negocio;
  created_at;
  updated_at;
  state;
}
export interface PrediccionesCross{
  predicciones:PrediccionCross[];
}

@Injectable({
  providedIn: 'root'
})
export class CrossService {

  constructor(private http: HttpClient) { }

  obtenerListaPredicciones(datos){
    return this.http.post<any>(`${apiUrl}/mdo/prediccionCrosseling/list/`,datos);
  }

}
