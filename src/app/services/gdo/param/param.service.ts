import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const  apiUrl:string  = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) { }
  obtenerListaParametros(datos){
    
    return this.http.post<any>(`${apiUrl}/gdo/param/list/`, datos);
     
  }
  obtenerListaTipos(){
    return this.http.get<any>(`${apiUrl}/gdo/param/list/tipo/`);
  }
  insertarParametro(
    datos
    ){
    return this.http.post<any>(`${apiUrl}/gdo/param/create/`,datos);
  }
  editarParametro(
    datos){
    return this.http.post<any>(`${apiUrl}/gdo/param/update/${datos.id}`,datos);
  }
  eliminarParametro(id){
    return this.http.delete<any>(`${apiUrl}/gdo/param/delete/${id}`,);
  }
  obtenerParametro(id){
    return this.http.get<any>(`${apiUrl}/gdo/param/listOne/${id}`,);
  }
  obtenerListaPadres(tipo){
    return this.http.post<any>(`${apiUrl}/gdo/param/list/tipo/todos/`,{tipo});
  }
  obtenerListaHijos(nombre,tipo){
    return this.http.post<any>(`${apiUrl}/gdo/param/list/filtro/nombre`,{tipo,nombre});
  }
  obtenerParametroNombreTipo(nombre,tipo){
    return this.http.post<any>(`${apiUrl}/gdo/param/list/listOne`,{nombre,tipo});
  }
}
