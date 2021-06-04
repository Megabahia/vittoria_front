import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const  apiUrl:string  = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ProspectosService {

  constructor(private http: HttpClient) { }
  obtenerFiltro(tipo){
    return this.http.post<any>(`${apiUrl}/mdm/param/list/tipo/todos/`, {tipo});
  }
  obtenerVendedor(rol){
    return this.http.post<any>(`${apiUrl}/adm/usuarios/list/rol/`, {rol});
  }
  obtenerLista(parametros){
    return this.http.post<any>(`${apiUrl}/mdm/prospectosClientes/list/`, parametros);
  }
  crearProspectos(data){
    return this.http.post<any>(`${apiUrl}/mdm/prospectosClientes/create/`, data);
  }
}
