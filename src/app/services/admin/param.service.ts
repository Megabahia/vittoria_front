import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../.././../environments/environment';
const  apiUrl:string  = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) {   }

  obtenerListaParametros(page,page_size,tipo,nombre){
    
    return this.http.post<any>(`${apiUrl}/adm/param/list/`, {
      page,page_size,tipo,nombre
     });
     
  }
  obtenerListaTipos(){
    return this.http.get<any>(`${apiUrl}/adm/param/list/tipo/`);
  }
  insertarParametro(nombre, tipo, descripcion){
    return this.http.post<any>(`${apiUrl}/adm/param/create/`,{nombre, tipo, descripcion});
  }
  editarParametro(id,nombre, tipo, descripcion){
    return this.http.post<any>(`${apiUrl}/adm/param/update/${id}`,{nombre, tipo, descripcion});
  }
  eliminarParametro(id){
 
    return this.http.delete<any>(`${apiUrl}/adm/param/delete/${id}`,);
  }
  obtenerParametro(id){
    return this.http.get<any>(`${apiUrl}/adm/param/listOne/${id}`,);
  }
}
