import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../.././../environments/environment';
import {Observable} from 'rxjs';

const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class IntegracionesEnviosService {

  constructor(private http: HttpClient) {
  }

  obtenerListaIntegracionesEnvios(page, page_size) {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/envios/list/`, {
      page, page_size
    });
  }
  obtenerListaIntegracionesEnviosSinAuth() {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/envios/list/noAuth`, {state: 1});
  }

  insertarIntegracionEnvio(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/envios/create/`, datos);
  }

  editarIntegracionEnvio(datos): Observable<any> {
    return this.http.post<any>(`${apiUrl}/adm/integraciones/envios/update/${datos.id}`, datos);
  }

  eliminarIntegracionEnvio(id): Observable<any> {
    return this.http.delete<any>(`${apiUrl}/adm/integraciones/envios/delete/${id}`);
  }

  obtenerIntegracionEnvio(id): Observable<any> {
    return this.http.get<any>(`${apiUrl}/adm/integraciones/envios/listOne/${id}`);
  }
}
