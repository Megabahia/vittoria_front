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

  obtenerListaIntegraciones(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/list/`, datos);
  }

  insertarIntegracion(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/create/`, datos);
  }

  editarIntegracion(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/update/${datos.id}`, datos);
  }

  editarIntegracionFormData(datos: FormData): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/update/${datos.get('id')}`, datos);
  }

  eliminarIntegracion(id): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/adm/integraciones/delete/${id}`);
  }

  obtenerIntegracion(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/integraciones/listOne/${id}`);
  }
}
