import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../.././../environments/environment';
const { apiUrl } = environment;
@Injectable({
  providedIn: 'root'
})
export class ParamService {

  constructor(private http: HttpClient) {   }

  obtenerListaParametros(page,page_size,idTipo,nombre){
    
    return this.http.post<any>(`${apiUrl}/adm/param/list/`, {
      page,page_size,idTipo:Number(idTipo),nombre
     });
     
  }
  obtenerListaTipos(){
    return this.http.get<any>(`${apiUrl}/adm/param/list/tipo/`);
  }
  insertarParametro(nombre, idTipo, descripcion){
    return this.http.post<any>(`${apiUrl}/adm/param/create/`,{nombre, idTipo, descripcion});
  }
  editarParametro(id,nombre, idTipo, descripcion){
    return this.http.post<any>(`${apiUrl}/adm/param/update/${id}`,{nombre, idTipo, descripcion});
  }
  eliminarParametro(id){
 
    return this.http.delete<any>(`${apiUrl}/adm/param/delete/${id}`,);
  }
  obtenerParametro(id){
    return this.http.get<any>(`${apiUrl}/adm/param/listOne/${id}`,);
  }
}
