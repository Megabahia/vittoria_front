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
    
    return this.http.post<any>(`${apiUrl}/mdp/param/list/`, datos);
     
  }
  obtenerListaTipos(){
    return this.http.get<any>(`${apiUrl}/mdp/param/list/tipo/`);
  }
  insertarParametro(
    nombre, 
    tipo, 
    descripcion,
    tipoVariable,
    valor,
    idPadre
    ){
    return this.http.post<any>(`${apiUrl}/mdp/param/create/`,{
      nombre, 
      tipo, 
      descripcion,
      tipoVariable,
      valor,
      idPadre});
  }
  editarParametro(
    id,
    nombre, 
    tipo, 
    descripcion,
    tipoVariable,
    valor,
    idPadre){
    return this.http.post<any>(`${apiUrl}/mdp/param/update/${id}`,{nombre, 
      tipo, 
      descripcion,
      tipoVariable,
      valor,
      idPadre});
  }
  eliminarParametro(id){
    return this.http.delete<any>(`${apiUrl}/mdp/param/delete/${id}`,);
  }
  obtenerParametro(id){
    return this.http.get<any>(`${apiUrl}/mdp/param/listOne/${id}`,);
  }
  obtenerListaPadres(tipo){
    return this.http.post<any>(`${apiUrl}/mdp/param/list/tipo/todos/`,{tipo});
  }
  obtenerListaHijos(nombre,tipo){
    return this.http.post<any>(`${apiUrl}/mdp/param/list/filtro/nombre`,{tipo,nombre});
  }
  obtenerParametroNombreTipo(nombre,tipo){
    return this.http.post<any>(`${apiUrl}/mdp/param/list/listOne`,{nombre,tipo});
  }
}
