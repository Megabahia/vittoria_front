import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const apiUrl: string = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class GestionOfertaService {

  constructor(private http: HttpClient) { }
  obtenerListaGestionOferta(datos) {
    return this.http.post<any>(`${apiUrl}/gdo/gestionOferta/list/`, datos);
  }
}
