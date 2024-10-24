import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MdpProveedoresService {

  constructor(private http: HttpClient) {
  }

  obtenerListaProveedores(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/proveedores/list/`, datos);
  }

  crearProveedor(datos) {
    return this.http.post<any>(`${apiUrl}/mdp/proveedores/create/`, datos);
  }

  actualizarProveedor(datos, id) {
    return this.http.post<any>(`${apiUrl}/mdp/proveedores/update/${id}`, datos);
  }

  obtenerProveedor(id) {
    return this.http.get<any>(`${apiUrl}/mdp/proveedores/listOne/${id}`);
  }
  eliminarProveedor(id) {
    return this.http.delete<any>(`${apiUrl}/mdp/proveedores/delete/${id}`);
  }

}
