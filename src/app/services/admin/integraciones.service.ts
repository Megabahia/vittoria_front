import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../.././../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class IntegracionesService {

  constructor(private http: HttpClient) {
  }

  obtenerListaIntegraciones(page, page_size) {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/list/`, {
      page, page_size
    });
  }

  insertarIntegracion(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/create/`, datos);
  }

  editarIntegracion(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/update/${datos.id}`, datos);
  }

  eliminarIntegracion(id): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/adm/integraciones/delete/${id}`);
  }

  obtenerIntegracion(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/integraciones/listOne/${id}`);
  }
}
