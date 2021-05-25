import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const  apiUrl:string  = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) { }
  obtenerListaParametros(page,page_size,tipo,nombre){
    
    return this.http.post<any>(`${apiUrl}/mdm/param/list/`, {
      page,page_size,tipo,nombre
     });
     
  }
  obtenerListaTipos(){
    return this.http.get<any>(`${apiUrl}/mdm/param/list/tipo/`);
  }
  insertarParametro(
    nombre, 
    tipo, 
    descripcion,
    tipoVariable,
    valor,
    idPadre
    ){
    return this.http.post<any>(`${apiUrl}/mdm/param/create/`,{
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
    return this.http.post<any>(`${apiUrl}/mdm/param/update/${id}`,{nombre, 
      tipo, 
      descripcion,
      tipoVariable,
      valor,
      idPadre});
  }
  eliminarParametro(id){
    return this.http.delete<any>(`${apiUrl}/mdm/param/delete/${id}`,);
  }
  obtenerParametro(id){
    return this.http.get<any>(`${apiUrl}/mdm/param/listOne/${id}`,);
  }
  obtenerListaPadres(tipo){
    return this.http.post<any>(`${apiUrl}/mdm/param/list/tipo/todos/`,{tipo});
  }
  
}
