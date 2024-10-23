import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {BehaviorSubject, Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class MdrpService {

  constructor(private http: HttpClient) {
  }

  obtenerListaProductos(datos) {
    return this.http.post<any>(`${apiUrl}/mdrp/productos/list/`, datos);
  }

  crearProducto(datos) {
    return this.http.post<any>(`${apiUrl}/mdrp/productos/create/`, datos);
  }

  actualizarProducto(datos, id) {
    return this.http.post<any>(`${apiUrl}/mdrp/productos/update/${id}`, datos);
  }

  obtenerProducto(id) {
    return this.http.get<any>(`${apiUrl}/mdrp/productos/listOne/${id}`);
  }

}
